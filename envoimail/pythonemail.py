import smtplib, os
from email.message import EmailMessage


email_user = os.getenv("EMAIL_EXPEDITEUR")
email_password = os.getenv("GMAIL_APP_PASSWORD")

msg = EmailMessage()
msg["Subject"] = "Test SMTP"
msg["From"] = email_user
msg["To"] = "votre_destinataire@test.com"
msg.set_content("Ceci est un test via SMTP Gmail")

with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
    smtp.ehlo()
    smtp.starttls()
    smtp.login("suan.tay.job@gmail.com", "grhv supo adsd kipf")
    smtp.send_message(msg)

print("E-mail envoyé avec succès !")
