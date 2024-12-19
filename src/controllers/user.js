const db = require("../DB");

const logUserIn = (req, res, handleErr) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if the user exists
  db.update();
  const user = db.users.find((user) => user.username === username);

  // Check the password if the user was found
  if (user && user.password === password) {
    // At this point, we know that the client is who they say they are

    // Generate a random 10 digit token
    const token = Math.floor(Math.random() * 10000000000).toString();

    // Save the generated token
    db.sessions.push({ userId: user.id, token: token });
    db.save();

    res.setHeader("Set-Cookie", `token=${token}; Path=/;`);
    res.status(200).json({ message: "Logged in successfully!" });
  } else {
    return handleErr({ status: 401, message: "Invalid username or password." });
  }
};

const logUserOut = (req, res) => {
  // Remove the session object form the db SESSIONS array
  db.update();
  const sessionIndex = db.sessions.findIndex(
    (session) => session.userId === req.userId
  );
  if (sessionIndex > -1) {
    db.sessions.splice(sessionIndex, 1);
    db.save();
  }
  res.setHeader(
    "Set-Cookie",
    `token=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );
  res.status(200).json({ message: "Logged out successfully!" });
};

const sendUserInfo = (req, res) => {
  db.update();
  const user = db.users.find((user) => user.id === req.userId);
  res.json({ username: user.username, name: user.name });
};

const updateUser = (req, res) => {
  const username = req.body.username;
  const name = req.body.name;
  const password = req.body.password;

  // Grab the user object that is currently logged in
  db.update();
  const user = db.users.find((user) => user.id === req.userId);

  user.username = username;
  user.name = name;

  // Only update the password if it is provided
  if (password) {
    user.password = password;
  }

  db.save();

  res.status(200).json({
    username: user.username,
    name: user.name,
    password_status: password ? "updated" : "not updated",
  });
};

const controller = {
  logUserIn,
  logUserOut,
  sendUserInfo,
  updateUser,
};

module.exports = controller;
