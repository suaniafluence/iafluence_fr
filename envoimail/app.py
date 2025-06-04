from flask import Flask, request, redirect, url_for, flash, render_template
import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'votre_cle_secrete')

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/envoimail', methods=['GET','POST'], strict_slashes=False)
def send_message():
    if request.method == "GET":
        print("redirect(url_for('index')) pour GET")
        # Si la méthode est GET, redirigez vers l'index ou affichez un message indiquant que cette URL est uniquement accessible en POST.
        return redirect(url_for('index'))
    # Sinon, pour POST, le code d'envoi d'email continue…
    try:
        firstname = request.form.get('firstname')
        lastname = request.form.get('lastname')
        email = request.form.get('email')
        phone = request.form.get('phone')
        service = request.form.get('service')
        message_text = request.form.get('message')
        print("Données reçues :", firstname, lastname, email, phone, service, message_text)

        msg = EmailMessage()
        msg.set_content(f"""
        Nouveau message de contact :

        Prénom : {firstname}
        Nom : {lastname}
        Email : {email}
        Téléphone : {phone}
        Service concerné : {service}

        Message :
        {message_text}
        """)
        msg['Subject'] = f'Contact via le site de {firstname} {lastname}'
        msg['From'] = os.getenv('EMAIL_EXPEDITEUR')
        msg['To'] = os.getenv('EMAIL_DESTINATAIRE')

        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(os.getenv('EMAIL_EXPEDITEUR'), os.getenv('GMAIL_APP_PASSWORD'))
            smtp.send_message(msg)
        print("Votre message a été envoyé avec succès !")
        flash("Votre message a été envoyé avec succès !")
    except Exception as e:
        flash(f"Erreur lors de l'envoi de l'email : {str(e)}")
        print(f"Erreur lors de l'envoi de l'email : {str(e)}")
    return redirect(url_for('index'))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
