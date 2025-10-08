import api from "./apiClient";

// Send approval email to intern
export async function sendApprovalEmail(internEmail, documentType, notes = "") {
  const { data } = await api.post("/email/send-approval", {
    to: internEmail,
    documentType,
    notes
  });
  return data;
}

// Send rejection email to intern
export async function sendRejectionEmail(internEmail, documentType, notes = "") {
  const { data } = await api.post("/email/send-rejection", {
    to: internEmail,
    documentType,
    notes
  });
  return data;
}

// Send general notification email
export async function sendNotificationEmail({ to, subject, content, template = "default" }) {
  const { data } = await api.post("/email/send-notification", {
    to,
    subject,
    content,
    template
  });
  return data;
}
