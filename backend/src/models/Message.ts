import { AV } from '../libs/leancloud';

// Interface describing the structure of a Message object in LeanCloud
// Add export keyword here
export interface IMessage {
  objectId?: string;
  fromUser: AV.Object; // Changed from AV.Pointer to AV.Object
  toUser: AV.Object;   // Changed from AV.Pointer to AV.Object
  content: string;
  // ... rest of the interface ...
}

// You could potentially add methods or static methods here if needed,
// similar to Mongoose models, but for basic structure, an interface is often enough.

export {}; // Add this empty export to make the file a module 