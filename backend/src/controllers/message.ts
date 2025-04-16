import { Request, Response } from 'express';
import { AV } from '../libs/leancloud';
import { AsyncRequestHandler } from '../types/express';
import { AuthError, AuthErrorType } from '../types/auth';
import { handleAuthError } from '../utils/errorHandler';
import { IMessage } from '../models/Message'; // Import the interface
import { JwtPayload } from '../types/auth'; // Import JwtPayload for req.user type

// Interface for the send message request body
interface SendMessageRequestBody {
  toUserId: string;
  content: string;
}

/**
 * @desc    Send a private message
 * @route   POST /api/messages/send
 * @access  Private
 */
export const sendMessage: AsyncRequestHandler = async (req, res) => {
  try {
    const { toUserId, content } = req.body as SendMessageRequestBody;
    const currentUser = req.user as JwtPayload; // Get authenticated user info

    // --- Input Validation ---
    if (!toUserId || !content) {
      // Ensure INVALID_INPUT is defined in AuthErrorType enum
      throw new AuthError('接收者ID和消息内容不能为空', AuthErrorType.INVALID_INPUT, 400);
    }

    if (!currentUser || !currentUser.userId) {
       // Ensure UNAUTHORIZED is defined in AuthErrorType enum
       throw new AuthError('无法获取发送者信息', AuthErrorType.UNAUTHORIZED, 401);
    }

    if (currentUser.userId === toUserId) {
        throw new AuthError('不能给自己发送消息', AuthErrorType.INVALID_INPUT, 400);
    }

    // --- Prepare Message Object ---
    const message = new AV.Object('Message');
    message.set('content', content);

    // Create Pointers for fromUser and toUser
    const sender = AV.Object.createWithoutData('_User', currentUser.userId);
    const receiver = AV.Object.createWithoutData('_User', toUserId);
    message.set('fromUser', sender);
    message.set('toUser', receiver);
    message.set('isRead', false); // Default isRead to false

    // --- Set ACL for Privacy ---
    const acl = new AV.ACL();
    acl.setReadAccess(currentUser.userId, true); // Sender can read
    acl.setWriteAccess(currentUser.userId, true); // Sender can write (e.g., delete)
    acl.setReadAccess(toUserId, true);          // Receiver can read
    // No public read/write access is granted by default
    message.setACL(acl);

    // --- Save Message to LeanCloud ---
    // useMasterKey: false ensures ACLs are checked during save if needed, but typically creation doesn't require this check unless Class permissions are strict
    await message.save(null, { useMasterKey: false }); 

    console.log(`消息发送成功: ${currentUser.userId} -> ${toUserId}`);

    // --- Return Success Response ---
    // Exclude ACL from direct response
    const responseMessage = message.toJSON();
    // Remove ACL field before sending response
    delete (responseMessage as any).ACL;

    res.status(201).json({ success: true, data: responseMessage });

  } catch (error: any) {
    // Check if the error is related to an invalid toUserId (e.g., User not found)
    // LeanCloud object not found error code is 101
    if (error.code === 101 && error.message?.includes('_User')) { 
        handleAuthError(new AuthError('接收用户不存在', AuthErrorType.USER_NOT_FOUND, 404), res);
    } else {
        handleAuthError(error, res);
    }
  }
};

/**
 * @desc    Get message history with another user
 * @route   GET /api/messages/history?otherUserId=<other_user_id>[&page=1&limit=50]
 * @access  Private
 */
export const getMessageHistory: AsyncRequestHandler = async (req, res) => {
  try {
    const currentUser = req.user as JwtPayload;
    const otherUserId = req.query.otherUserId as string;

    // --- Input Validation ---
    if (!otherUserId) {
      throw new AuthError('必须提供 otherUserId 查询参数', AuthErrorType.INVALID_INPUT, 400);
    }
    if (!currentUser || !currentUser.userId) {
       throw new AuthError('无法获取当前用户信息', AuthErrorType.UNAUTHORIZED, 401);
    }
    if (currentUser.userId === otherUserId) {
        throw new AuthError('不能查询和自己的消息历史', AuthErrorType.INVALID_INPUT, 400);
    }

    // --- Prepare Pointers ---
    const currentUserPointer = AV.Object.createWithoutData('_User', currentUser.userId);
    const otherUserPointer = AV.Object.createWithoutData('_User', otherUserId);

    // --- Build Query ---
    // Query for messages sent FROM current user TO other user
    const query1 = new AV.Query('Message');
    query1.equalTo('fromUser', currentUserPointer);
    query1.equalTo('toUser', otherUserPointer);

    // Query for messages sent FROM other user TO current user
    const query2 = new AV.Query('Message');
    query2.equalTo('fromUser', otherUserPointer);
    query2.equalTo('toUser', currentUserPointer);

    // Combine queries with OR
    const mainQuery = AV.Query.or(query1, query2);

    // --- Sorting and Pagination ---
    mainQuery.ascending('createdAt'); // Sort by creation time, oldest first

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50; // Default limit 50
    // Ensure limit doesn't exceed a maximum (e.g., 100) for performance
    const effectiveLimit = Math.min(limit, 100); 
    mainQuery.limit(effectiveLimit);
    mainQuery.skip((page - 1) * effectiveLimit);
    
    // Include pointer data to get user info in one query (optional)
    // mainQuery.include('fromUser');
    // mainQuery.include('toUser');

    // --- Execute Query ---
    // Use find({ useMasterKey: false }) to respect ACLs
    const messages = await mainQuery.find({ useMasterKey: false });

    // --- (Optional) Mark messages as read ---
    // Filter messages sent TO the current user that are marked as unread
    const unreadMessages = messages.filter(
      (msg) => msg.get('toUser').id === currentUser.userId && !msg.get('isRead')
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach(msg => msg.set('isRead', true));
      try {
        // Save all updated messages, assert type for saveAll
        await AV.Object.saveAll(unreadMessages as AV.Object[], { useMasterKey: false });
        console.log(`标记了 ${unreadMessages.length} 条消息为已读: from ${otherUserId} to ${currentUser.userId}`);
      } catch (saveError) {
        console.error('标记消息已读时出错:', saveError);
        // Non-critical error, proceed with returning messages
      }
    }

    // --- Return Message History ---
    // Convert messages to JSON and remove ACL field
    const responseMessages = messages.map(msg => {
        const jsonMsg = msg.toJSON();
        delete (jsonMsg as any).ACL;
        return jsonMsg;
    });
    
    // For proper pagination, also return total count and total pages
    // Note: count() should use the same query conditions but without limit/skip
    const countQuery = AV.Query.or(query1, query2); // Create a new query for count
    const totalCount = await countQuery.count({ useMasterKey: false });
    const totalPages = Math.ceil(totalCount / effectiveLimit);

    res.status(200).json({
      success: true, 
      data: responseMessages, 
      pagination: {
          currentPage: page,
          pageSize: effectiveLimit,
          totalPages,
          totalCount
      }
    });

  } catch (error: any) {
     if (error.code === 101 && error.message?.includes('_User')) { 
        handleAuthError(new AuthError('查询的用户不存在', AuthErrorType.USER_NOT_FOUND, 404), res);
    } else {
        handleAuthError(error, res);
    }
  }
}; 