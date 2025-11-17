# notifications.py - Notification System following SOLID principles

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@dataclass
class NotificationContext:
    """Context data for notifications"""
    recipient: Any  # User, Student, Instructor, etc.
    subject_data: Dict[str, Any]
    template_data: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None


class NotificationChannel(ABC):
    """Abstract base class for notification channels (Interface Segregation)"""

    @abstractmethod
    def send(self, context: NotificationContext) -> bool:
        """Send notification through this channel"""
        pass

    @abstractmethod
    def can_send_to(self, recipient: Any) -> bool:
        """Check if this channel can send to the recipient"""
        pass


class EmailNotificationChannel(NotificationChannel):
    """Email notification implementation"""

    def can_send_to(self, recipient: Any) -> bool:
        """Check if recipient has email"""
        return hasattr(recipient, 'email') and bool(getattr(recipient, 'email', None))

    def send(self, context: NotificationContext) -> bool:
        """Send email notification"""
        try:
            recipient_email = context.recipient.email
            subject = self._render_subject(context.subject_data)
            message = self._render_message(context.template_data)

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                html_message=self._render_html_message(context.template_data),
                fail_silently=False
            )

            if settings.DEBUG:
                logger.info(f"Email notification sent to {recipient_email}: {subject}")

            return True

        except Exception as e:
            logger.error(f"Failed to send email notification to {context.recipient}: {e}")
            return False

    def _render_subject(self, subject_data: Dict[str, Any]) -> str:
        """Render email subject"""
        return subject_data.get('subject', 'Notification')

    def _render_message(self, template_data: Dict[str, Any]) -> str:
        """Render plain text message"""
        return template_data.get('message', '')

    def _render_html_message(self, template_data: Dict[str, Any]) -> str:
        """Render HTML message"""
        return template_data.get('html_message', '')


class InAppNotificationChannel(NotificationChannel):
    """In-app notification implementation (for future use)"""

    def can_send_to(self, recipient: Any) -> bool:
        """Always can send in-app notifications"""
        return True

    def send(self, context: NotificationContext) -> bool:
        """Send in-app notification (placeholder for future implementation)"""
        # TODO: Implement in-app notification storage
        if settings.DEBUG:
            logger.info(f"In-app notification would be sent to {context.recipient}: {context.subject_data}")
        return True


class NotificationTemplate(ABC):
    """Abstract base class for notification templates"""

    @abstractmethod
    def get_subject_data(self, **kwargs) -> Dict[str, Any]:
        """Get subject data for the notification"""
        pass

    @abstractmethod
    def get_template_data(self, **kwargs) -> Dict[str, Any]:
        """Get template data for the notification"""
        pass


class ClassGenerationNotificationTemplate(NotificationTemplate):
    """Template for class generation notifications"""

    def get_subject_data(self, **kwargs) -> Dict[str, Any]:
        pattern_name = kwargs.get('pattern_name', 'Unknown Pattern')
        return {
            'subject': f'New Classes Generated: {pattern_name}'
        }

    def get_template_data(self, **kwargs) -> Dict[str, Any]:
        pattern_name = kwargs.get('pattern_name', 'Unknown Pattern')
        class_count = kwargs.get('class_count', 0)
        start_date = kwargs.get('start_date', 'Unknown Date')

        message = f"""
New classes have been generated for pattern: {pattern_name}

Details:
- Pattern: {pattern_name}
- Classes Generated: {class_count}
- Start Date: {start_date}
- Generated At: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}

Please check your schedule for the new classes.
"""

        html_message = f"""
<html>
<body>
    <h2>New Classes Generated</h2>
    <p>New classes have been generated for pattern: <strong>{pattern_name}</strong></p>

    <h3>Details:</h3>
    <ul>
        <li><strong>Pattern:</strong> {pattern_name}</li>
        <li><strong>Classes Generated:</strong> {class_count}</li>
        <li><strong>Start Date:</strong> {start_date}</li>
        <li><strong>Generated At:</strong> {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}</li>
    </ul>

    <p>Please check your schedule for the new classes.</p>
</body>
</html>
"""

        return {
            'message': message.strip(),
            'html_message': html_message.strip()
        }


class StudentEnrollmentNotificationTemplate(NotificationTemplate):
    """Template for student enrollment notifications"""

    def get_subject_data(self, **kwargs) -> Dict[str, Any]:
        class_name = kwargs.get('class_name', 'Unknown Class')
        return {
            'subject': f'Enrolled in Class: {class_name}'
        }

    def get_template_data(self, **kwargs) -> Dict[str, Any]:
        class_name = kwargs.get('class_name', 'Unknown Class')
        instructor_name = kwargs.get('instructor_name', 'Unknown Instructor')
        scheduled_time = kwargs.get('scheduled_time', 'Unknown Time')
        location = kwargs.get('location', 'Unknown Location')

        message = f"""
You have been enrolled in a new class!

Details:
- Class: {class_name}
- Instructor: {instructor_name}
- Date & Time: {scheduled_time}
- Location: {location}

Please arrive on time and bring all necessary materials.
"""

        html_message = f"""
<html>
<body>
    <h2>Class Enrollment Confirmation</h2>
    <p>You have been enrolled in a new class!</p>

    <h3>Class Details:</h3>
    <ul>
        <li><strong>Class:</strong> {class_name}</li>
        <li><strong>Instructor:</strong> {instructor_name}</li>
        <li><strong>Date & Time:</strong> {scheduled_time}</li>
        <li><strong>Location:</strong> {location}</li>
    </ul>

    <p>Please arrive on time and bring all necessary materials.</p>
</body>
</html>
"""

        return {
            'message': message.strip(),
            'html_message': html_message.strip()
        }


class NotificationService:
    """Main notification service following Dependency Inversion principle"""

    def __init__(self, channels: Optional[List[NotificationChannel]] = None):
        """Initialize with notification channels"""
        if channels is None:
            # Default channels - can be configured via settings
            self.channels = [
                EmailNotificationChannel(),
                InAppNotificationChannel(),
            ]
        else:
            self.channels = channels

    def send_notification(
        self,
        template: NotificationTemplate,
        recipients: List[Any],
        **template_kwargs
    ) -> Dict[str, int]:
        """
        Send notification to multiple recipients using specified template

        Returns dict with success/failure counts per channel
        """
        results = {'email': {'success': 0, 'failed': 0}, 'in_app': {'success': 0, 'failed': 0}}

        subject_data = template.get_subject_data(**template_kwargs)
        template_data = template.get_template_data(**template_kwargs)

        for recipient in recipients:
            context = NotificationContext(
                recipient=recipient,
                subject_data=subject_data,
                template_data=template_data,
                metadata={'template_kwargs': template_kwargs}
            )

            for channel in self.channels:
                if channel.can_send_to(recipient):
                    channel_name = self._get_channel_name(channel)
                    try:
                        if channel.send(context):
                            results[channel_name]['success'] += 1
                        else:
                            results[channel_name]['failed'] += 1
                    except Exception as e:
                        logger.error(f"Notification failed for {recipient} via {channel_name}: {e}")
                        results[channel_name]['failed'] += 1

        return results

    def _get_channel_name(self, channel: NotificationChannel) -> str:
        """Get channel name for reporting"""
        if isinstance(channel, EmailNotificationChannel):
            return 'email'
        elif isinstance(channel, InAppNotificationChannel):
            return 'in_app'
        else:
            return 'unknown'


# Singleton instance for easy access
notification_service = NotificationService()