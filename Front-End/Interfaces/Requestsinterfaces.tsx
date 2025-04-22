// Enum for user roles
enum UserRole {
  CLIENT = 1,
  WORKER = 2,
}

// Enum for request status
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
  status: RequestStatus;
  location: string;
  working_time: string;
  description: string;
  canceled: boolean;
  sent_time?: string;
  images: string[];
}

// Interface for requests associated with a worker
interface RequestOnWorker extends BaseRequest {
  username_Client?: string;
  client_profile_image?: string;
  worker_comment?: string;
}

// Interface for requests associated with a client
interface RequestOnClient extends BaseRequest {
  username_Worker?: string;
  worker_profile_image?: string;
  workStartedTime?: string;
  workCompletedClaimTime?: string;
}

// Union type for requests
type Request = RequestOnWorker | RequestOnClient;

export {
  BaseRequest,
  RequestOnWorker,
  RequestOnClient,
  Request,
  UserRole,
  RequestStatus,
};
