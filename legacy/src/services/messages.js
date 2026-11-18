const limits = { name: 100, email: 200, subject: 160, message: 5000 };

export function normalizeContact(input) {
  const result = {};
  for (const [key, maxLength] of Object.entries(limits)) {
    const value = typeof input[key] === 'string' ? input[key].trim() : '';
    if (!value || value.length > maxLength) {
      throw new Error(`Please provide a valid ${key} (up to ${maxLength} characters).`);
    }
    result[key] = value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) {
    throw new Error('Please provide a valid email address.');
  }
  return result;
}

export async function submitContact(client, input) {
  const values = normalizeContact(input);
  if (!client) throw new Error('The message service is unavailable.');
  const { error } = await client.rpc('picarview_submit_message', {
    p_name: values.name,
    p_email: values.email,
    p_subject: values.subject,
    p_message: values.message,
  });
  if (error) throw error;
}
