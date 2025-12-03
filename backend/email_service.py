import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
import models
from encryption import decrypt_smtp_password

def get_smtp_config(db: Session):
    """Get SMTP configuration from database"""
    return db.query(models.SMTPConfig).first()

def send_email(db: Session, to_email: str, subject: str, html_content: str) -> bool:
    """
    Send email using configured SMTP server.
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    smtp_config = get_smtp_config(db)
    
    if not smtp_config:
        print("SMTP not configured")
        return False
    
    try:
        # Decrypt password
        smtp_password = decrypt_smtp_password(smtp_config.smtp_password)
        
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = smtp_config.from_email
        message["To"] = to_email
        
        # Add HTML content
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        # Connect and send
        with smtplib.SMTP(smtp_config.smtp_server, smtp_config.smtp_port) as server:
            if smtp_config.use_tls:
                server.starttls()
            server.login(smtp_config.smtp_username, smtp_password)
            server.send_message(message)
        
        return True
        
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_password_reset_email(db: Session, user_email: str, reset_token: str, username: str) -> bool:
    """Send password reset email to user"""
    reset_link = f"http://localhost/reset-password?token={reset_token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }}
            .footer {{ text-align: center; color: #64748b; font-size: 12px; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Reset Password</h1>
            </div>
            <div class="content">
                <p>Ciao <strong>{username}</strong>,</p>
                <p>Abbiamo ricevuto una richiesta per reimpostare la password del tuo account SpeseCasa.</p>
                <p>Clicca sul pulsante qui sotto per reimpostare la tua password:</p>
                <p style="text-align: center;">
                    <a href="{reset_link}" class="button">Reimposta Password</a>
                </p>
                <p>Oppure copia e incolla questo link nel tuo browser:</p>
                <p style="background: white; padding: 10px; border-radius: 5px; font-size: 12px; word-break: break-all;">
                    {reset_link}
                </p>
                <p><strong>Questo link scadrà tra 1 ora.</strong></p>
                <p>Se non hai richiesto il reset della password, ignora questa email.</p>
            </div>
            <div class="footer">
                <p>© 2025 SpeseCasa Lite | Gestione Spese Personali</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(db, user_email, "Reset Password - SpeseCasa", html_content)
