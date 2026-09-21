import crypto from 'crypto';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS';

export interface NotificationPayload {
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  channel: NotificationChannel;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

export interface NotificationResult {
  id: string;
  recipientId: string;
  channel: NotificationChannel;
  status: 'DELIVERED' | 'FAILED' | 'SKIPPED_DUPLICATE';
  timestamp: Date;
}

export class NotificationService {
  private static deliveredKeys = new Set<string>();

  /**
   * Dispatches a notification to the specified channel with idempotency guarantee.
   */
  public static async send(payload: NotificationPayload): Promise<NotificationResult> {
    const idempotencyKey =
      payload.idempotencyKey ||
      crypto
        .createHash('sha256')
        .update(`${payload.recipientId}:${payload.channel}:${payload.title}:${payload.message}`)
        .digest('hex');

    if (this.deliveredKeys.has(idempotencyKey)) {
      return {
        id: idempotencyKey,
        recipientId: payload.recipientId,
        channel: payload.channel,
        status: 'SKIPPED_DUPLICATE',
        timestamp: new Date(),
      };
    }

    // In a production environment with BullMQ, jobs are added to the 'notifications' queue
    // For local dev/testing, we log to stdout and track idempotency in-memory
    switch (payload.channel) {
      case 'EMAIL':
        console.log(`[Notification:EMAIL] To: ${payload.recipientEmail || payload.recipientId} | Subject: ${payload.title}`);
        console.log(`[Notification:EMAIL Body] ${payload.message}`);
        break;
      case 'SMS':
        console.log(`[Notification:SMS] To: ${payload.recipientPhone || payload.recipientId} | Message: ${payload.message}`);
        break;
      case 'IN_APP':
        console.log(`[Notification:IN_APP] To: ${payload.recipientId} | ${payload.title}: ${payload.message}`);
        break;
    }

    this.deliveredKeys.add(idempotencyKey);

    return {
      id: idempotencyKey,
      recipientId: payload.recipientId,
      channel: payload.channel,
      status: 'DELIVERED',
      timestamp: new Date(),
    };
  }

  /**
   * Broadcasts draft publication notifications to all assigned students.
   */
  public static async notifyAllotmentPublished(students: Array<{ id: string; email?: string; phone?: string; roomNumber: string; hostelName: string }>): Promise<number> {
    let sentCount = 0;
    for (const student of students) {
      await this.send({
        recipientId: student.id,
        recipientEmail: student.email,
        recipientPhone: student.phone,
        channel: 'EMAIL',
        title: 'Hostel Allocation Published - Action Required',
        message: `Your hostel room has been officially allotted: Room ${student.roomNumber} in ${student.hostelName}. Please log in to download your allotment letter.`,
        idempotencyKey: `pub-${student.id}-${student.roomNumber}`,
      });
      sentCount++;
    }
    return sentCount;
  }

  /**
   * Notifies a student of a waitlist auto-promotion to a newly vacant bed.
   */
  public static async notifyWaitlistPromotion(student: { id: string; email?: string; roomNumber: string; hostelName: string }): Promise<void> {
    await this.send({
      recipientId: student.id,
      recipientEmail: student.email,
      channel: 'EMAIL',
      title: 'Waitlist Update: You Have Been Promoted!',
      message: `A vacancy has become available! You have been auto-promoted from the waiting list to Room ${student.roomNumber}, ${student.hostelName}.`,
      idempotencyKey: `wl-promo-${student.id}-${student.roomNumber}`,
    });
  }

  /**
   * Clears the in-memory idempotency cache (useful for testing).
   */
  public static clearCache(): void {
    this.deliveredKeys.clear();
  }
}
