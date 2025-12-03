from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import models
import schemas
import crud
from database import get_db
from auth import get_current_user, get_password_hash
import email_service
from encryption import encrypt_smtp_password, decrypt_smtp_password

router = APIRouter(
    prefix="/api/config",
    tags=["configuration"],
)

# SMTP Configuration (Superadmin Only)
@router.get("/smtp", response_model=schemas.SMTPConfigResponse)
def get_smtp_config(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only superadmin can view SMTP config")
    
    config = db.query(models.SMTPConfig).first()
    if not config:
        raise HTTPException(status_code=404, detail="SMTP not configured")
    
    # Return config without exposing password
    return config

@router.put("/smtp", response_model=schemas.SMTPConfigResponse)
def update_smtp_config(
    smtp_config: schemas.SMTPConfigCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only superadmin can configure SMTP")
    
    # Encrypt the password before storing
    encrypted_password = encrypt_smtp_password(smtp_config.smtp_password)
    
    existing_config = db.query(models.SMTPConfig).first()
    
    if existing_config:
        # Update existing
        existing_config.smtp_server = smtp_config.smtp_server
        existing_config.smtp_port = smtp_config.smtp_port
        existing_config.smtp_username = smtp_config.smtp_username
        existing_config.smtp_password = encrypted_password
        existing_config.from_email = smtp_config.from_email
        existing_config.use_tls = smtp_config.use_tls
        db.commit()
        db.refresh(existing_config)
        return existing_config
    else:
        # Create new
        new_config = models.SMTPConfig(
            smtp_server=smtp_config.smtp_server,
            smtp_port=smtp_config.smtp_port,
            smtp_username=smtp_config.smtp_username,
            smtp_password=encrypted_password,
            from_email=smtp_config.from_email,
            use_tls=smtp_config.use_tls
        )
        db.add(new_config)
        db.commit()
        db.refresh(new_config)
        return new_config

@router.post("/smtp/test")
def test_smtp_config(
    test_email: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only superadmin can test SMTP")
    
    success = email_service.send_email(
        db, 
        test_email, 
        "Test SMTP - SpeseCasa",
        "<h1>Test Email</h1><p>La configurazione SMTP funziona correttamente!</p>"
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send test email")
    
    return {"message": "Test email sent successfully"}

# Password Reset Flow
@router.post("/forgot-password")
def forgot_password(
    email: str,
    db: Session = Depends(get_db)
):
    # Find user by email
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user:
        # Don't reveal if email exists or not (security best practice)
        return {"message": "If this email exists, a password reset link has been sent"}
    
    # Generate reset token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    # Save token to database
    reset_token = models.PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    db.add(reset_token)
    db.commit()
    
    # Send email
    email_service.send_password_reset_email(db, user.email, token, user.username)
    
    return {"message": "If this email exists, a password reset link has been sent"}

@router.post("/reset-password")
def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    # Find token
    reset_token = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == token,
        models.PasswordResetToken.used == False
    ).first()
    
    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    # Check if token is expired
    if reset_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token has expired")
    
    # Get user
    user = db.query(models.User).filter(models.User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update password
    user.hashed_password = get_password_hash(new_password)
    reset_token.used = True
    db.commit()
    
    return {"message": "Password reset successfully"}

@router.post("/change-password")
def change_password(
    old_password: str,
    new_password: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from auth import verify_password
    
    # Verify old password
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Old password is incorrect")
    
    # Update to new password
    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}
