VERIFICATION_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white !important; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Verifikasi Email Kamu</h1>
        <p>Terima kasih telah mendaftar. Silakan klik tombol di bawah ini untuk memverifikasi alamat email kamu:</p>
        <a href="{{ verification_url }}" class="button">Verifikasi Email</a>
        <p>Atau salin link ini: {{ verification_url }}</p>
        <p>Link ini akan kedaluwarsa dalam 24 jam.</p>
    </div>
</body>
</html>
"""

PASSWORD_RESET_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white !important; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Reset Password Kamu</h1>
        <p>Klik tombol di bawah ini untuk membuat password baru:</p>
        <a href="{{ reset_url }}" class="button">Reset Password</a>
        <p>Atau salin link ini: {{ reset_url }}</p>
        <p>Link ini akan kedaluwarsa dalam 1 jam.</p>
    </div>
</body>
</html>
"""
