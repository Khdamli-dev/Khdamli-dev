// Enum for user roles
enum UserRole {
    CLIENT = 1,
    WORKER = 2,
  }
  
  enum RequestStatus {
    ON_HOLD = "onhold",
    ACCEPTED = "accepted",
    PENDING_CLIENT_VERIFICATION = "pending_client_verification",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    REJECTED = "rejected",
  }
  // Base interface for requests
  interface BaseRequest {
    id: number;
    category: string;
    location: string;
    RequestDate: string;
    WorkDate: string;
    WorkTime: string;
    payment: string;
    AboutService: string;
    canceled: boolean;
    service?: string;
    sent_time?: string;
    images: string[]; // Changed String[] to string[] for TypeScript convention
  }
  
  // Interface for requests associated with a worker
  interface RequestOnWorker extends BaseRequest {
    username_Client: string;
    client_profile_image?: string;
  }
  
  // Interface for requests associated with a client
  interface RequestOnClient extends BaseRequest {
    username_Worker?: string;
    worker_profile_image?: string;
    worker_comment?: string;
  }
  
  // Union type for requests
  type Request = RequestOnWorker | RequestOnClient;
  
  export { BaseRequest, RequestOnWorker, RequestOnClient, Request, UserRole };