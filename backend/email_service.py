import asyncio
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USER)

async def send_email(to_email: str, subject: str, html_content: str):
    """Send email to ANY user email address"""
    if not all([SMTP_USER, SMTP_PASSWORD, SMTP_HOST]):
        print("❌ SMTP credentials missing!")
        return False
    
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = SMTP_FROM_EMAIL
        message["To"] = to_email
        
        html_part = MIMEText(html_content, "html", "utf-8")
        message.attach(html_part)

        async with aiosmtplib.SMTP(
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            use_tls=False,
            start_tls=True,
            validate_certs=True
        ) as smtp:
            await smtp.login(SMTP_USER, SMTP_PASSWORD)
            await smtp.sendmail(SMTP_FROM_EMAIL, to_email, message.as_string())
        
        print(f"✅ Email sent to {to_email}: {subject}")
        return True
        
    except Exception as e:
        print(f"❌ Email failed to {to_email}: {str(e)}")
        return False

# 🔥 ALL REQUIRED FUNCTIONS:
async def send_task_created_email(user_email: str, task_title: str, task_description: str = "", due_date: str = ""):
    """Task created notification"""
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

async def send_task_completed_email(user_email: str, task_title: str):  # 🔥 ADDED THIS
    """Task completed notification"""
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

async def send_task_deleted_email(user_email: str, task_title: str):  # 🔥 ADDED THIS
    """Task deleted notification"""
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

async def send_task_reminder_email(user_email: str, task_title: str, task_description: str = ""):  # 🔥 ADDED THIS
    """Task reminder notification"""
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

async def test_email():
    """Test all email functions"""
    print("🧪 Testing all email functions...")
    test_email = "abhidynamite6@gmail.com"  # Change this to test other emails
    
    success = await send_task_created_email(test_email, "Test Task")
    print(f"Created: {'✅' if success else '❌'}")
    
    return success

if __name__ == "__main__":
    asyncio.run(test_email())
