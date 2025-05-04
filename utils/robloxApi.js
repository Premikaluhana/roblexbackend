const axios = require('axios');

const getRobloxProfile = async (username) => {
  try {
    // Step 1: Get Roblox User ID
    const userResponse = await axios.post(
      'https://users.roblox.com/v1/usernames/users',
      {
        usernames: [username],
        excludeBannedUsers: false
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (!userResponse.data.data.length) {
      throw new Error('Invalid Roblox username');
    }

    const user = userResponse.data.data[0];

    // Step 2: Get Roblox Avatar
    const avatarResponse = await axios.get(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=420x420&format=Png&isCircular=false`
    );

    const avatar = avatarResponse.data.data[0].imageUrl;

    return {
      id: user.id,
      username: user.name,
      avatar
    };

  } catch (error) {
    console.error(error);
    throw new Error('Invalid Roblox username');
  }
};

module.exports = { getRobloxProfile };