'use strict';

class Avatar {
  constructor(id, name, picUrl) {
    this.id = id;
    this.name = name;
    this.picUrl = picUrl;
  }
}

const avatarList = ['avatar_1', 'avatar_2', 'avatar_3', 'avatar_4', 'avatar_5'];

const getRandomAvatar = (playerMap) => {
  let id = 0;
  let usedIds = [];

  do {
    id = Math.floor(Math.random() * (avatarList.length - 1));

    if (usedIds.includes(id) === false) {
      usedIds.push(id);

      // emergency stop
      if (usedIds.length === avatarList.length) {
        return null;
      }
    }
  } while (isAvatarAlreadyUsed(id, playerMap) === true);

  return new Avatar(id, avatarList[id], `./img/user/user_${id}.png`);
};

const isAvatarAlreadyUsed = (id, playerMap) => {
  if (playerMap == null) {
    return false;
  }

  for (const player of playerMap.values()) {
    if (player.avatar.id === id) {
      return true;
    }
  }

  return false;
};

exports.getRandomAvatar = getRandomAvatar;
