import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

# Get encryption key from environment or generate one
# In production, this MUST be set via environment variable
ENCRYPTION_KEY = os.getenv('SMTP_ENCRYPTION_KEY')

if not ENCRYPTION_KEY:
    # Generate a key for development - WARNING: This will change on restart!
    # In production, set SMTP_ENCRYPTION_KEY environment variable
    ENCRYPTION_KEY = Fernet.generate_key().decode()
    print("WARNING: Using auto-generated encryption key. Set SMTP_ENCRYPTION_KEY env var in production!")

def get_fernet():
    """Get Fernet instance for encryption/decryption"""
    # Ensure key is bytes
    key_bytes = ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY
    # Pad or truncate to 32 bytes for Fernet
    if len(key_bytes) != 44:  # Base64 encoded 32 bytes = 44 chars
        # Derive proper key using PBKDF2
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'spesecasa_salt',  # In production, use a proper random salt
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(key_bytes))
    else:
        key = key_bytes
    return Fernet(key)

def encrypt_smtp_password(password: str) -> str:
    """Encrypt SMTP password for secure storage"""
    f = get_fernet()
    encrypted = f.encrypt(password.encode())
    return encrypted.decode()

def decrypt_smtp_password(encrypted_password: str) -> str:
    """Decrypt SMTP password for use"""
    f = get_fernet()
    decrypted = f.decrypt(encrypted_password.encode())
    return decrypted.decode()
