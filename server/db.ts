import bcrypt from 'bcryptjs';
import {
  UserModel,
  ComplaintModel,
  ChatMessageModel,
  FeedbackModel,
  NotificationModel,
  UserDoc,
  ComplaintDoc,
  ChatMessageDoc,
  FeedbackDoc,
  NotificationDoc,
  AttachmentDoc,
  TimelineDoc,
} from './models';

export {
  UserModel,
  ComplaintModel,
  ChatMessageModel,
  FeedbackModel,
  NotificationModel,
};

export type {
  UserDoc,
  ComplaintDoc,
  ChatMessageDoc,
  FeedbackDoc,
  NotificationDoc,
  AttachmentDoc,
  TimelineDoc,
};

export async function seedMongoDB(force: boolean = false): Promise<void> {
  const userCount = await UserModel.countDocuments();
  if (userCount > 0 && !force) {
    console.log(`MongoDB already populated with ${userCount} users. Skipping auto-seed.`);
    return;
  }

  if (force) {
    console.log('Force re-seeding MongoDB collections...');
    await Promise.all([
      UserModel.deleteMany({}),
      ComplaintModel.deleteMany({}),
      ChatMessageModel.deleteMany({}),
      FeedbackModel.deleteMany({}),
      NotificationModel.deleteMany({}),
    ]);
  }

  console.log('Seeding initial demo data into MongoDB...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const defaultUsers: UserDoc[] = [
    {
      id: 'usr-alex',
      name: 'Alex Rivera',
      email: 'alex@example.com',
      phone: '+1 (555) 234-5678',
      passwordHash,
      role: 'user',
      department: 'Operations',
      title: 'Operations Analyst',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuATSxsxQQJQVOe4fe3qu82ylWcQEx1a7vBP0jy5kMNbvTeVf6SN8oGC31n5LBEvdhihadmUPRRM1QPwqOKrAR70gvsMYsVUnYnICSFpvIxjfMHALz39TEXqkCF5YUwXkZyMKrXKOc_kqra5JK1qDHcvVAdap5jtjUEMBHDVfV1wK8A3B4NkpoPUEP6L34MOOA-2-V2ZXK1AhX_w-T6MhBPnYj6OB3iVXqzacDpjZFZU4q1KL7N2YAIr',
      createdAt: '2024-10-01T10:00:00Z',
    },
    {
      id: 'usr-marcus',
      name: 'Marcus T.',
      email: 'marcus.t@resolvsafe.internal',
      phone: '+1 (555) 890-1234',
      passwordHash,
      role: 'agent',
      department: 'Facilities Mgmt',
      title: 'Senior Safety Liaison',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCQfOAKN-gTqquyA3onLB_DCL9bnvXA_7zwKQwvhs1daCV_gzbMrMZrNhnP0gmSNevbw2qdfX-GL2_npCRhC4dcqW-wRs5P-FU-1H1KWuXdJFgBb1gm5bjXDHSyleQ76s-hCLH1Cqp4STi_xlkhWXfqfqFjn4VzetXwHxTi93TV6OscmTzXG3qtztIt8jPDPW6REb_K1R0IdrVT02hM6R4wHCuSyl-XH3cYlcEtJoskzfwyAj4SP-iY',
      createdAt: '2024-09-15T08:30:00Z',
    },
    {
      id: 'usr-sarah',
      name: 'Sarah Jenkins',
      email: 'sarah.j@resolvsafe.internal',
      phone: '+1 (555) 789-0123',
      passwordHash,
      role: 'agent',
      department: 'Human Resources',
      title: 'Compliance Specialist',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB2XAlLogsrycT0PGIyMvVxpqt37yhpc4OBKGMg7mV3WJSeqZdXpRXsbZNqBS_1xPOmsMaVMcL9VsgJDcq2lbSXsqBoPavupjftLqbEbvZkSECtj7bQe8umDTy9lHOdxCaJtrWNLUXHfRE8QJryTNF22V_IgahPYkWMi-_AsMlAoP_bQeyMZmD9lbSQelgZMw2kjy-za_Pc7L15Yk1Kyy4-cdFv5Z_ibTywHsOARF85EKK5lJXudmrD',
      createdAt: '2024-09-10T09:15:00Z',
    },
    {
      id: 'usr-admin',
      name: 'Admin User',
      email: 'admin@resolvsafe.internal',
      phone: '+1 (555) 000-0000',
      passwordHash,
      role: 'admin',
      department: 'Executive',
      title: 'System Administrator',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBvq6HbWe7y7HkI4ZfXQvu3XNjWJnUV0suRyb6Eh-FvqPn1TX4WIaJcLLmxO18zhY9CBb3e0Vkj1bizvw_UAEgMdqG2VJlYa4FS4K9nzW6SuoelkmjzXpZKK-NTb_SRtxImyfZnuy2Qmc2_S0L5GZFFAdAovDEBg_JFLl06eHGdzXJKfnHeXDFW8ovXgtYu-dZ0QOxbkwlDyV-32hf4fZApq5a4XcGzPtTRKwCkvVUsrw9nj8ReBQPM',
      createdAt: '2024-08-01T00:00:00Z',
    },
  ];

  const defaultComplaints: ComplaintDoc[] = [
    {
      id: 'CMP-2024-0891',
      title: 'Unsafe Work Conditions in Warehouse B',
      description:
        'There has been an ongoing issue with a leaking pipe in Warehouse B near aisle 14 for the past two weeks. The water is pooling on the floor, creating a severe slip hazard for forklift operators and personnel on foot. Additionally, it appears the leak is close to an electrical panel. I have reported this to the floor supervisor twice but no action has been taken.',
      category: 'Logistics & Storage',
      department: 'Logistics & Storage',
      priority: 'high',
      status: 'in_progress',
      submittedBy: {
        id: 'usr-alex',
        name: 'Anonymous Employee',
        email: 'alex@example.com',
        isAnonymous: true,
      },
      assignedAgent: {
        id: 'usr-marcus',
        name: 'Marcus T.',
        role: 'Senior Safety Liaison',
        email: 'marcus.t@resolvsafe.internal',
        phone: '+1 (555) 890-1234',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCQfOAKN-gTqquyA3onLB_DCL9bnvXA_7zwKQwvhs1daCV_gzbMrMZrNhnP0gmSNevbw2qdfX-GL2_npCRhC4dcqW-wRs5P-FU-1H1KWuXdJFgBb1gm5bjXDHSyleQ76s-hCLH1Cqp4STi_xlkhWXfqfqFjn4VzetXwHxTi93TV6OscmTzXG3qtztIt8jPDPW6REb_K1R0IdrVT02hM6R4wHCuSyl-XH3cYlcEtJoskzfwyAj4SP-iY',
        department: 'Facilities Mgmt',
        avgResponseTime: '1.2 hrs',
      },
      attachments: [
        {
          id: 'att-1',
          name: 'IMG_8472_puddle.jpg',
          size: '2.4 MB',
          type: 'image/jpeg',
        },
        {
          id: 'att-2',
          name: 'incident_report_draft.pdf',
          size: '842 KB',
          type: 'application/pdf',
        },
      ],
      timeline: [
        {
          id: 'tml-1',
          title: 'Status changed to In Progress',
          description: 'Maintenance team dispatched to assess the electrical panel hazard.',
          timestamp: 'Today, 09:15 AM',
          actor: {
            name: 'Marcus T. (Agent)',
            role: 'Senior Safety Liaison',
            avatar:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBXRRjIjwVYpEK7YOfW5tQxxjzGlicZx3tdz4PJKSGOhJmyooKi9TmLemULZ3_tstYsNamZOT58xhz7s5rv8JcvuNzJEAQMVBkUfbL_yi5jZ8YiP5lFDfcpQYW6YfezdqelgMVatC9pq4Z2oeQXiszxD61Z4X9DNtm71buBIisg7MNCGRHzaZCv7DSOC8hcgeddPo_y4hxXUYoTHrkRkPMEgHMxwWgNKzt-ChzbwzysTx6HtGNBvFVH',
          },
          type: 'status',
        },
        {
          id: 'tml-2',
          title: 'Assigned to Marcus T.',
          description: 'Ticket escalated due to high priority tag (electrical hazard).',
          timestamp: 'Oct 24, 15:30 EST',
          type: 'assigned',
        },
        {
          id: 'tml-3',
          title: 'Complaint Submitted',
          description: 'System auto-generated ticket #CMP-2024-0891.',
          timestamp: 'Oct 24, 14:32 EST',
          type: 'created',
        },
      ],
      createdAt: '2024-10-24T14:32:00Z',
      updatedAt: '2024-10-25T09:15:00Z',
    },
    {
      id: 'RS-4921',
      title: 'Billing discrepancy on last invoice',
      description: 'Customer reported a double charge for the monthly subscription service initiated on the 14th.',
      category: 'Billing & Finance',
      department: 'Billing & Finance',
      priority: 'high',
      status: 'new',
      submittedBy: {
        id: 'usr-alex',
        name: 'Alex Rivera',
        email: 'alex@example.com',
      },
      assignedAgent: null,
      attachments: [],
      timeline: [
        {
          id: 'tml-4',
          title: 'Complaint Logged',
          description: 'Customer initiated inquiry regarding invoice #INV-9921.',
          timestamp: '2h ago',
          type: 'created',
        },
      ],
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 'RS-4925',
      title: 'Service outage in region 4',
      description: 'Multiple users reporting inability to access the main dashboard since morning update.',
      category: 'Technical Support',
      department: 'IT Support',
      priority: 'medium',
      status: 'new',
      submittedBy: {
        id: 'usr-alex',
        name: 'Alex Rivera',
        email: 'alex@example.com',
      },
      assignedAgent: null,
      attachments: [],
      timeline: [
        {
          id: 'tml-5',
          title: 'Outage Ticket Submitted',
          description: 'Identified latency spikes on us-east regional gateway.',
          timestamp: '4h ago',
          type: 'created',
        },
      ],
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    },
    {
      id: 'RS-4890',
      title: 'Account access recovery request',
      description: 'User locked out after multiple failed attempts. Needs identity verification.',
      category: 'Technical Support',
      department: 'IT Support',
      priority: 'medium',
      status: 'in_progress',
      substatusNote: 'Awaiting ID scan review',
      submittedBy: {
        id: 'usr-alex',
        name: 'Alex Rivera',
        email: 'alex@example.com',
      },
      assignedAgent: {
        id: 'usr-marcus',
        name: 'Marcus T.',
        role: 'Senior Safety Liaison',
        email: 'marcus.t@resolvsafe.internal',
        phone: '+1 (555) 890-1234',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCQfOAKN-gTqquyA3onLB_DCL9bnvXA_7zwKQwvhs1daCV_gzbMrMZrNhnP0gmSNevbw2qdfX-GL2_npCRhC4dcqW-wRs5P-FU-1H1KWuXdJFgBb1gm5bjXDHSyleQ76s-hCLH1Cqp4STi_xlkhWXfqfqFjn4VzetXwHxTi93TV6OscmTzXG3qtztIt8jPDPW6REb_K1R0IdrVT02hM6R4wHCuSyl-XH3cYlcEtJoskzfwyAj4SP-iY',
        department: 'Facilities Mgmt',
        avgResponseTime: '1.2 hrs',
      },
      attachments: [
        {
          id: 'att-3',
          name: 'photo_id_scan.png',
          size: '1.1 MB',
          type: 'image/png',
        },
      ],
      timeline: [
        {
          id: 'tml-6',
          title: 'Assigned to Agent',
          description: 'Ticket assigned for biometric scan inspection.',
          timestamp: '1d ago',
          type: 'assigned',
        },
      ],
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    },
    {
      id: 'RS-4812',
      title: 'Feature request: Export to PDF',
      description: 'Asked for clarification on specific formatting needs. Waiting on customer reply.',
      category: 'Technical Support',
      department: 'IT Support',
      priority: 'low',
      status: 'pending_info',
      substatusNote: 'Waiting on customer reply',
      submittedBy: {
        id: 'usr-alex',
        name: 'Alex Rivera',
        email: 'alex@example.com',
      },
      assignedAgent: {
        id: 'usr-sarah',
        name: 'Sarah Jenkins',
        role: 'Compliance Specialist',
        email: 'sarah.j@resolvsafe.internal',
        phone: '+1 (555) 789-0123',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB2XAlLogsrycT0PGIyMvVxpqt37yhpc4OBKGMg7mV3WJSeqZdXpRXsbZNqBS_1xPOmsMaVMcL9VsgJDcq2lbSXsqBoPavupjftLqbEbvZkSECtj7bQe8umDTy9lHOdxCaJtrWNLUXHfRE8QJryTNF22V_IgahPYkWMi-_AsMlAoP_bQeyMZmD9lbSQelgZMw2kjy-za_Pc7L15Yk1Kyy4-cdFv5Z_ibTywHsOARF85EKK5lJXudmrD',
        department: 'Human Resources',
        avgResponseTime: '2.0 hrs',
      },
      attachments: [],
      timeline: [
        {
          id: 'tml-7',
          title: 'Clarification requested',
          description: 'Requested template sample from user.',
          timestamp: '3d ago',
          type: 'note',
        },
      ],
      createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    },
  ];

  const defaultMessages: ChatMessageDoc[] = [
    {
      id: 'msg-1',
      complaintId: 'CMP-2024-0891',
      senderId: 'usr-marcus',
      senderName: 'Marcus T.',
      senderRole: 'agent',
      senderAvatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBXRRjIjwVYpEK7YOfW5tQxxjzGlicZx3tdz4PJKSGOhJmyooKi9TmLemULZ3_tstYsNamZOT58xhz7s5rv8JcvuNzJEAQMVBkUfbL_yi5jZ8YiP5lFDfcpQYW6YfezdqelgMVatC9pq4Z2oeQXiszxD61Z4X9DNtm71buBIisg7MNCGRHzaZCv7DSOC8hcgeddPo_y4hxXUYoTHrkRkPMEgHMxwWgNKzt-ChzbwzysTx6HtGNBvFVH',
      message:
        "Hello, I've just been assigned your ticket. I am contacting maintenance right now to address the electrical concern.",
      timestamp: '15:36',
    },
    {
      id: 'msg-2',
      complaintId: 'CMP-2024-0891',
      senderId: 'usr-alex',
      senderName: 'Anonymous Employee',
      senderRole: 'user',
      message: 'Thank you, please let me know when they arrive so I can direct them to the exact spot.',
      timestamp: '15:38',
    },
  ];

  const defaultNotifications: NotificationDoc[] = [
    {
      id: 'notif-1',
      userId: 'usr-alex',
      title: 'Agent Assigned',
      description: 'Sarah Jenkins has been assigned to your complaint #R-8495.',
      type: 'agent_assigned',
      read: false,
      timestamp: '2 mins ago',
      complaintId: 'CMP-2024-0891',
    },
    {
      id: 'notif-2',
      userId: 'usr-alex',
      title: 'Status Updated',
      description: "Complaint #R-8492 moved to 'In Review'.",
      type: 'status_updated',
      read: false,
      timestamp: '1 hour ago',
      complaintId: 'CMP-2024-0891',
    },
    {
      id: 'notif-3',
      userId: 'usr-alex',
      title: 'Complaint Received',
      description: 'Your initial complaint was successfully logged into the system.',
      type: 'complaint_received',
      read: true,
      timestamp: 'Yesterday',
      complaintId: 'CMP-2024-0891',
    },
  ];

  await UserModel.insertMany(defaultUsers);
  await ComplaintModel.insertMany(defaultComplaints);
  await ChatMessageModel.insertMany(defaultMessages);
  await NotificationModel.insertMany(defaultNotifications);

  console.log('MongoDB successfully seeded with demo users, complaints, messages, and notifications!');
}
