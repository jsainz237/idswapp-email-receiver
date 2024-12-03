import config from "./config.mjs";

export function processEmail(emailData, forwardTo) {
  const idswappForwarder = config.SES_MAIL_FROM;

  // Extract original sender info
  const fromMatch = emailData.match(/From: ([^<]+)?<([^>]+)>/);
  const senderName = fromMatch ? fromMatch[1]?.trim() : '';
  const senderEmail = fromMatch ? fromMatch[2].trim() : '';

  // Create new headers
  const newFrom = senderName 
    ? `From: ${senderName} (${senderEmail}) via IDSwapp <${idswappForwarder}>`
    : `From: ${senderEmail} via IDSwapp <${idswappForwarder}>`;
  const newReplyTo = senderName
    ? `Reply-To: ${senderName} <${senderEmail}>`
    : `Reply-To: <${senderEmail}>`;
  const newTo = `To: ${forwardTo}`;
  
  // Replace/add headers
  const modifiedEmail = emailData
      .replace(/^From: .*$/m, newFrom)
      .replace(/^To: .*$/m, newTo)
      .replace(/^Message-ID: .*\r?\n/m, '')
      .replace(/^Return-Path: .*\r?\n/m, '')
      .replace(/^dkim-signature:[\t ]?.*\r?\n(\s+.*\r?\n)*/mgi, '')
      // Add Reply-To after From header
      .replace(newFrom, `${newFrom}\n${newReplyTo}`);
  
  return modifiedEmail;
};
