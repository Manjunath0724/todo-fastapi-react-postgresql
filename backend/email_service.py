# Purpose: Centralized transactional email sending (SendGrid)
# Why: Provides consistent user notifications across auth and task events
# How: Exposed helper functions are called from FastAPI routes in main.py

import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load API credentials from env (.env during local dev)
from dotenv import load_dotenv
load_dotenv()

# Required credentials: SMTP configs
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")

# Send a single HTML email via SMTP
async def send_email(to_email: str, subject: str, html_content: str):
    """Send email to ANY user email address using SMTP"""
    if not all([SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL]):
        print("❌ SMTP credentials missing!")
        return False

    try:
        message = MIMEMultipart()
        message["From"] = SMTP_FROM_EMAIL
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(html_content, "html"))

        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            use_tls=False,
            start_tls=True,
        )

        print(f"✅ Email sent to {to_email}: {subject}")
        return True

    except Exception as e:
        print(f"❌ Email failed to {to_email}: {str(e)}")
        return False


# 🔥 Notification functions
# Purpose: event-specific templates for tasks/auth flows
# How: each builds HTML and delegates to send_email()
async def send_task_created_email(user_email: str, task_title: str, task_description: str = "", due_date: str = ""):
    html_content = f"""
    <html><body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">TaskFlow Pro</h1>
                <p style="color: #DBEAFE;">New Task Created! 🚀</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1E293B;">{task_title}</h2>
                {task_description and f'<p style="color: #64748B;">{task_description}</p>' or ''}
                {due_date and f'<p style="color: #64748B;"><strong>📅 Due:</strong> {due_date}</p>' or ''}
                <div style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost:3000/tasks" style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        View All Tasks →
                    </a>
                </div>
            </div>
        </div>
    </body></html>
    """
    return await send_email(user_email, f"✅ New Task: {task_title}", html_content)


async def send_task_completed_email(user_email: str, task_title: str):
    html_content = f"""
    <html><body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">TaskFlow Pro</h1>
                <p style="color: #D1FAE5;">Task Completed! 🎉</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1E293B;">{task_title}</h2>
                <p style="color: #10B981;">Great job! Keep it up! 💪</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost:3000/analytics" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        View Analytics →
                    </a>
                </div>
            </div>
        </div>
    </body></html>
    """
    return await send_email(user_email, f"🎉 Task Completed: {task_title}", html_content)


async def send_task_deleted_email(user_email: str, task_title: str):
    html_content = f"""
    <html><body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">TaskFlow Pro</h1>
                <p style="color: #FEE2E2;">Task Deleted</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1E293B;">{task_title}</h2>
                <p style="color: #64748B;">This task has been removed from your list.</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost:3000/tasks" style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        View All Tasks →
                    </a>
                </div>
            </div>
        </div>
    </body></html>
    """
    return await send_email(user_email, f"🗑️ Task Deleted: {task_title}", html_content)


async def send_task_reminder_email(user_email: str, task_title: str, task_description: str = ""):
    html_content = f"""
    <html><body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">TaskFlow Pro</h1>
                <p style="color: #FEF3C7;">Task Reminder ⏰</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1E293B;">{task_title}</h2>
                {task_description and f'<p style="color: #64748B;">{task_description}</p>' or ''}
                <p style="color: #F59E0B;">Don't forget to complete this task! 🚀</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost:3000/tasks" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        View Task →
                    </a>
                </div>
            </div>
        </div>
    </body></html>
    """
    return await send_email(user_email, f"⏰ Reminder: {task_title}", html_content)


# ==================== AUTH EMAILS ====================


async def send_account_created_email(user_email: str, full_name: str):
    html_content = f"""
    <html><body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">Welcome to TaskFlow Pro</h1>
                <p style="color: #DBEAFE;">Your account has been created ✅</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="color: #1E293B;">Hi {full_name or 'there'},</p>
                <p style="color: #64748B;">
                    Thanks for signing up for <strong>TaskFlow Pro</strong>. Your workspace is ready –
                    you can start creating tasks, tracking progress, and staying organized.
                </p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost:3000/dashboard" style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Open Dashboard →
                    </a>
                </div>
            </div>
        </div>
    </body></html>
    """
    return await send_email(user_email, "🎉 Your TaskFlow Pro account is ready", html_content)


async def send_login_notification_email(user_email: str):
    html_content = f"""
    <html><body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">New Login to TaskFlow Pro</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="color: #64748B;">
                    Your TaskFlow Pro account was just used to sign in.
                    If this was you, you can safely ignore this email.
                </p>
                <p style="color: #64748B;">
                    If you don't recognize this activity, we recommend you reset your password immediately.
                </p>
            </div>
        </div>
    </body></html>
    """
    return await send_email(user_email, "🔐 New login to your TaskFlow Pro account", html_content)


async def send_signup_otp_email(user_email: str, code: str):
    html_content = f"""
    <html><body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">Verify your email</h1>
                <p style="color: #DBEAFE;">Complete your TaskFlow Pro signup</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; text-align: center;">
                <p style="color: #64748B;">Use the following one-time password (OTP) to finish creating your account:</p>
                <p style="font-size: 28px; letter-spacing: 6px; font-weight: bold; color: #1D4ED8; margin: 20px 0;">
                    {code}
                </p>
                <p style="color: #64748B; font-size: 14px;">
                    This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.
                </p>
            </div>
        </div>
    </body></html>
    """
    return await send_email(user_email, "🔐 Your TaskFlow Pro signup code", html_content)


async def send_login_otp_email(user_email: str, code: str):
    html_content = f"""
    <html><body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">Login verification</h1>
                <p style="color: #E0F2FE;">Enter this code to sign in</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; text-align: center;">
                <p style="color: #64748B;">Use the following one-time password (OTP) to complete your login:</p>
                <p style="font-size: 28px; letter-spacing: 6px; font-weight: bold; color: #0369A1; margin: 20px 0;">
                    {code}
                </p>
                <p style="color: #64748B; font-size: 14px;">
                    This code is valid for <strong>10 minutes</strong>. If you did not attempt to log in, you can ignore this email.
                </p>
            </div>
        </div>
    </body></html>
    """
    return await send_email(user_email, "🔑 Your TaskFlow Pro login code", html_content)


# 🔧 Local utility: quick send test for templates (not used in production)
async def test_email():
    print("🧪 Testing all email functions...")
    test_email = "abhidynamite6.gmail.com"
    
    await send_task_created_email(test_email, "Test Task", "This is a test task description.", "2024-12-31")
