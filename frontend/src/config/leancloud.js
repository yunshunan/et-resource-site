// LeanCloud Configuration
// Replace these placeholder values with your actual LeanCloud project configuration
import AV from 'leancloud-storage';

// Initialize LeanCloud SDK with your AppID, AppKey and ServerURL
// You will need to replace these values with your actual LeanCloud project settings
// from the LeanCloud console (https://console.leancloud.cn or https://console.leancloud.app)
AV.init({
  appId: import.meta.env.VITE_LEANCLOUD_APP_ID || "YOUR_APP_ID",
  appKey: import.meta.env.VITE_LEANCLOUD_APP_KEY || "YOUR_APP_KEY",
  serverURL: import.meta.env.VITE_LEANCLOUD_SERVER_URL || "https://your-server-url.leancloud.cn"
});

// Export the AV object for use throughout the application
export default AV;

// Usage instructions:
// 1. Create a LeanCloud account and project at https://leancloud.app
// 2. Find your AppID, AppKey, and ServerURL in the LeanCloud dashboard
// 3. Add your app's LeanCloud configuration values to your .env file
// 4. Import this AV instance in your services or components to use LeanCloud

/*
Example usage:

// Creating a new object
const Todo = new AV.Object('Todo');
Todo.set('title', 'Build an awesome app');
Todo.set('completed', false);
Todo.save().then(savedTodo => {
  console.log('Todo saved:', savedTodo.id);
});

// Querying objects
const query = new AV.Query('Todo');
query.equalTo('completed', false);
query.find().then(todos => {
  console.log('Incomplete todos:', todos);
});

// User authentication
const user = new AV.User();
user.setUsername('username');
user.setPassword('password');
user.signUp().then(user => {
  console.log('User created:', user.id);
});
*/ 