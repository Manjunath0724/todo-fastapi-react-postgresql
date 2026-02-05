import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")

async def send_email(to_email: str, subject: str, html_content: str):
    """Send email to ANY user email address using SendGrid Web API"""
    if not all([SENDGRID_API_KEY, SMTP_FROM_EMAIL]):
        print("❌ SendGrid credentials missing!")
        return False

    try:
        message = Mail(
            from_email=SMTP_FROM_EMAIL,
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)

        if response.status_code in [200, 202]:
            print(f"✅ Email sent to {to_email}: {subject}")
            return True
        else:
            print(f"❌ Email failed to {to_email}: {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Email failed to {to_email}: {str(e)}")
        return False


# 🔥 Notification functions
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


# 🔧 Test function
async def test_email():
    print("🧪 Testing all email functions...")
    test_email = "abhidynamite6.gmail.com"