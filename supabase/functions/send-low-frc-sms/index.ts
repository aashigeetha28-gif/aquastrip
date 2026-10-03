// Supabase Edge Function: send-low-frc-sms
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { sendSms } from './smsProvider.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    // Accepts either standard DB webhook payload { record: ... } or direct invocation { alert_id: ... }
    const alertRecord = body.record || body;
    const alertId = alertRecord.id || body.alert_id;

    if (!alertId) {
      return new Response(JSON.stringify({ error: 'Missing alert_id or record' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Fetch latest alert data from database
    const { data: alert, error: fetchErr } = await supabase
      .from('alerts')
      .select('*, tests(*)')
      .eq('id', alertId)
      .single();

    if (fetchErr || !alert) {
      return new Response(JSON.stringify({ error: `Alert not found: ${fetchErr?.message}` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Check if already sent or if sent via offline SMS fallback
    if (alert.sms_status === 'sent') {
      return new Response(JSON.stringify({ message: 'SMS already sent previously' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (alert.sms_sent_via_fallback) {
      console.log(`[send-low-frc-sms] Alert ${alertId} already sent via offline SMS fallback. Skipping double-send.`);
      await supabase
        .from('alerts')
        .update({ sms_status: 'fallback_sent', updated_at: new Date().toISOString() })
        .eq('id', alertId);

      return new Response(JSON.stringify({ message: 'Skipped: sent via offline fallback' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Find supervisor phone for this village or cluster
    const { data: supervisor } = await supabase
      .from('users')
      .select('phone, name')
      .eq('role', 'supervisor')
      .limit(1)
      .maybeSingle();

    const supervisorPhone = supervisor?.phone || Deno.env.get('DEFAULT_SUPERVISOR_PHONE') || '+919876543211';

    // 4. Format SMS body strictly as required:
    // "LOW CHLORINE ALERT: {village}, FRC below 0.2 ppm, tested {time}. Please recheck and rechlorinate."
    const villageName = alert.village_name || 'Village Drinking Post';
    const testTime = alert.created_at
      ? new Date(alert.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : 'recently';

    const smsMessage = `LOW CHLORINE ALERT: ${villageName}, FRC below 0.2 ppm, tested ${testTime}. Please recheck and rechlorinate.`;

    // 5. Send SMS via isolated provider
    const smsResult = await sendSms({
      recipientPhone: supervisorPhone,
      message: smsMessage,
    });

    // 6. Update database row with success or failure and timestamp
    const nowIso = new Date().toISOString();
    if (smsResult.success) {
      await supabase
        .from('alerts')
        .update({
          sms_status: 'sent',
          sms_error: null,
          updated_at: nowIso,
        })
        .eq('id', alertId);

      return new Response(
        JSON.stringify({
          success: true,
          messageId: smsResult.messageId,
          provider: smsResult.provider,
          message: 'SMS dispatched to supervisor',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else {
      // Record failure on row to allow background retries
      await supabase
        .from('alerts')
        .update({
          sms_status: 'failed',
          sms_error: smsResult.error || 'Gateway failure',
          updated_at: nowIso,
        })
        .eq('id', alertId);

      return new Response(
        JSON.stringify({
          success: false,
          error: smsResult.error,
          provider: smsResult.provider,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
