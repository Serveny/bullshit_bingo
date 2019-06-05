"use strict";

class Avatar {
    constructor(id, name, picUrl) {
        this.id = id;
        this.name = name;
        this.picUrl = picUrl;
    }
}

const avatarList = [
    'Baby Chrizzy',
    'Biancer',
    'Der böse Wolf',
    'Drachenbruder',
    'Drachenlady',
    'Erdbeerchen',
    'Ey Malla',
    'Gummibeerchen',
    'Leiffelsbursche',
    'Nachber',
    'Reiner',
    'Ramoner',
    'Riter',
    'Rudi',
    'Marion',
    'Zoomulle',
];

const getRandomAvatar = (players) => {
    let i = 0;
    do {
        i = Math.floor(Math.random() * (avatarList.length - 1));
    } while (isAvatarAlreadyUsed(i, players) === true);

    return new Avatar(i, avatarList[i], `./img/user/user_${i}.png`);
};

const isAvatarAlreadyUsed = (id, players) => {
    if (players == null) {
        return false;
    }

    for (let i = 0; i < players.length; i++) {
        if (name === players[i].name) {
            return true;
        }
    }
    return false;
}

exports.getRandomAvatar = getRandomAvatar;