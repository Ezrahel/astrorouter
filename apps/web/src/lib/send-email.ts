export async function sendViaZepto({
  recipientEmail,
  htmlString,
  subject,
  senderEmail = "no-reply@astroroute.dev",
  senderName = "AstroRoute",
}: {
  recipientEmail: string;
  htmlString: string;
  subject: string;
  senderEmail?: string;
  senderName?: string;
}): Promise<void> {
  const url = "https://api.zeptomail.com/v1.1/email";
  const token = process.env.ZEPTO_API_KEY;

  const senderAddress = senderEmail.includes("<")
    ? senderEmail.split("<")[1].replace(">", "").trim()
    : senderEmail;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Zoho-enczapikey ${token}`,
    },
    body: JSON.stringify({
      from: {
        address: senderAddress,
        name: senderName,
      },
      to: [
        {
          email_address: {
            address: recipientEmail,
            name: recipientEmail.split("@")[0],
          },
        },
      ],
      subject,
      htmlbody: htmlString,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to send email: ${response.status} - ${errorData}`);
  }
}
