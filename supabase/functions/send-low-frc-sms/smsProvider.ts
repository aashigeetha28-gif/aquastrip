/**
 * Isolated SMS Gateway Provider (MSG91 / Fast2SMS) for Supabase Edge Functions.
 * Keys are kept exclusively in Supabase secrets.
 * Supports DRY_RUN mode (default in dev) which logs instead of calling the external gateway.
 */

export interface SendSmsParams {
  recipientPhone: string;
  message: string;
  senderId?: string;
  templateId?: string;
}

export interface SendSmsResult {
  success: boolean;
  provider: 'MSG91' | 'Fast2SMS' | 'DRY_RUN';
  messageId?: string;
  error?: string;
}

export async function sendSms(params: SendSmsParams): Promise<SendSmsResult> {
  const isDryRun = Deno.env.get('DRY_RUN') === 'true' || !Deno.env.get('SMS_API_KEY');
  const provider = (Deno.env.get('SMS_GATEWAY_PROVIDER') || 'MSG91').toUpperCase();

  // 1. DRY RUN / Development Simulation
  if (isDryRun) {
    console.log(`[DRY_RUN SMS] Dispatching to ${params.recipientPhone} via ${provider}:`);
    console.log(`[DRY_RUN SMS Body]: "${params.message}"`);
    return {
      success: true,
      provider: 'DRY_RUN',
      messageId: `dry_run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
  }

  // Sanitize phone number (e.g. "+91 98765 43210" -> "919876543210")
  const sanitizedPhone = params.recipientPhone.replace(/[^0-9]/g, '');

  // 2. MSG91 Provider Implementation
  if (provider === 'MSG91') {
    const authKey = Deno.env.get('SMS_API_KEY') || Deno.env.get('MSG91_AUTH_KEY');
    const sender = Deno.env.get('MSG91_SENDER_ID') || 'JJMWTR';

    try {
      const response = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          'authkey': authKey || '',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          template_id: Deno.env.get('MSG91_TEMPLATE_ID') || 'jjm_low_frc_alert',
          short_url: '0',
          recipients: [
            {
              mobiles: sanitizedPhone,
              message: params.message,
            },
          ],
        }),
      });

      const data = await response.json();
      if (response.ok && data.type !== 'error') {
        return {
          success: true,
          provider: 'MSG91',
          messageId: data.message || `msg91_${Date.now()}`,
        };
      } else {
        return {
          success: false,
          provider: 'MSG91',
          error: data.message || 'MSG91 API error response',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        provider: 'MSG91',
        error: err.message || 'Network error calling MSG91 gateway',
      };
    }
  }

  // 3. Fast2SMS Provider Implementation
  if (provider === 'FAST2SMS') {
    const apiKey = Deno.env.get('SMS_API_KEY') || Deno.env.get('FAST2SMS_API_KEY');

    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: params.message,
          language: 'english',
          flash: 0,
          numbers: sanitizedPhone,
        }),
      });

      const data = await response.json();
      if (data.return) {
        return {
          success: true,
          provider: 'Fast2SMS',
          messageId: data.request_id || `f2s_${Date.now()}`,
        };
      } else {
        return {
          success: false,
          provider: 'Fast2SMS',
          error: data.message?.[0] || 'Fast2SMS error',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        provider: 'Fast2SMS',
        error: err.message || 'Network error calling Fast2SMS gateway',
      };
    }
  }

  return {
    success: false,
    provider: 'DRY_RUN',
    error: `Unknown SMS provider: ${provider}`,
  };
}
