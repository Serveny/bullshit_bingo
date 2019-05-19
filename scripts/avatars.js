const avatars = [
    'Baby Chrizzy',
    'Biancer',
    'Der böse Wolf',
    'Drachenbruder',
    'Drachenlady',
    'Erdbeerchen',
    'Ey Malla',
    'Gummibeerchen',
    'Leiffels',
    'Nachber',
    'Reiner',
    'Ramoner',
    'Riter',
    'Rudi',
    'Marion',
    'Zoomulle',
];

const getRandomAvatar = function(players) {
    let avatar = {};
    do {
        const i = Math.floor(Math.random() * (avatars.length - 1));
        avatar = { 
            name: avatars[i], 
            urlPic: './img/user/user_' + i + '.png' 
        }
    } while (isAvatarAlreadyUsed(avatar.name, players) === true);

    return avatar;
};

const isAvatarAlreadyUsed = function(name, players) {
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