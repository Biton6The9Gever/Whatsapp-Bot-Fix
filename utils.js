const fs = require("fs");
const path = require("path");

const menusPath = path.join(__dirname, 'menus.json');
let menus = {}; 

function loadMenus() {
    try {
        const data = fs.readFileSync(menusPath, 'utf8');
        menus = JSON.parse(data);
        console.log('Menus reloaded:', menus);
    } catch (err) {
        console.error('Error loading menus:', err);
    }
}

// Initial load
loadMenus();

// Watch the file for changes
fs.watchFile(menusPath, { interval: 500 }, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
        console.log('menus.json changed, reloading...');
        loadMenus();
    }
});

async function isInGroup(client, userId) {
    try {
        const chats = await client.getChats();
        const groups = chats.filter(chat => chat.isGroup);

        for (const group of groups) {
            if (group.participants.some(p => p.id._serialized === userId)) {
                return {
                    inGroup: true,
                    groupId: group.id._serialized,
                    groupName: group.name
                };
            }
        }
        return { inGroup: false };
    } catch (err) {
        console.error("Error in isInGroup:", err.message);
        return { inGroup: false, error: err.message };
    }
}

module.exports = {
    init: (log, logError, mainClient) => {
        log('Menus loaded:', menus);
    },
    getMenus: () => menus,
    isInGroup
};
