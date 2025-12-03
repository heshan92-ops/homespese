import re
from typing import Tuple

def validate_password(password: str) -> Tuple[bool, str]:
    """
    Validate password against OWASP recommendations.
    
    Requirements:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter  
    - At least 1 digit
    - At least 1 special character
    
    Returns:
        Tuple[bool, str]: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "La password deve contenere almeno 8 caratteri"
    
    if not re.search(r'[A-Z]', password):
        return False, "La password deve contenere almeno una lettera maiuscola"
    
    if not re.search(r'[a-z]', password):
        return False, "La password deve contenere almeno una lettera minuscola"
    
    if not re.search(r'\d', password):
        return False, "La password deve contenere almeno un numero"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "La password deve contenere almeno un carattere speciale (!@#$%^&*(),.?\":{}|<>)"
    
    # Check against common passwords (basic list)
    common_passwords = [
        'password', 'Password1!', '12345678', 'qwerty', 'abc123', 
        'password123', 'admin123', 'Passw0rd!', '1q2w3e4r'
    ]
    if password.lower() in [p.lower() for p in common_passwords]:
        return False, "Questa password è troppo comune"
    
    return True, ""

def get_password_strength(password: str) -> dict:
    """
    Calculate password strength for frontend indicator.
    
    Returns:
        dict: {
            'score': int (0-4),
            'feedback': list of improvement suggestions
        }
    """
    score = 0
    feedback = []
    
    if len(password) >= 8:
        score += 1
    else:
        feedback.append("Aggiungi almeno 8 caratteri")
    
    if re.search(r'[A-Z]', password):
        score += 1
    else:
        feedback.append("Aggiungi una lettera maiuscola")
    
    if re.search(r'[a-z]', password):
        score += 0.5
    else:
        feedback.append("Aggiungi una lettera minuscola")
    
    if re.search(r'\d', password):
        score += 0.5
    else:
        feedback.append("Aggiungi un numero")
    
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 1
    else:
        feedback.append("Aggiungi un carattere speciale")
    
    if len(password) >= 12:
        score += 1
        
    return {
        'score': min(int(score), 4),
        'feedback': feedback
    }
