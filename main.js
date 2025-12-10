// 你想使用的域名，比如 temp.xxx.com（你 Cloudflare Workers 会用到）
const CUSTOM_DOMAIN = "yourdomain.com";

// Mail.tm API
const API = "https://api.mail.tm";

let currentEmail = "";
let currentToken = "";

// 工具函数：生成随机字符串
function randomString(len=8) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let str = "";
    for (let i = 0; i < len; i++) str += chars[Math.floor(Math.random() * chars.length)];
    return str;
}

// 创建邮箱账号
async function createEmail() {
    const username = randomString() + "@" + CUSTOM_DOMAIN;

    const password = randomString(12);

    // 注册账号
    await fetch(`${API}/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: username, password })
    });

    // 登录获取 token
    const tokenRes = await fetch(`${API}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: username, password })
    });

    const tokenData = await tokenRes.json();
    currentToken = tokenData.token;
    currentEmail = username;

    document.getElementById("email").value = username;
}

// 拉取收件箱
async function loadInbox() {
    if (!currentToken) return;
    const res = await fetch(`${API}/messages`, {
        headers: { Authorization: "Bearer " + currentToken }
    });
    const data = await res.json();

    const inboxDiv = document.getElementById("inbox");

    inboxDiv.innerHTML = "";

    data["hydra:member"].forEach(mail => {
        const div = document.createElement("div");
        div.className = "mail-item";
        div.textContent = mail.subject;
        div.onclick = () => alert(mail.intro);
        inboxDiv.appendChild(div);
    });
}

// 初始化
document.getElementById("newEmailBtn").onclick = async () => {
    await createEmail();
    loadInbox();
};

document.getElementById("copyBtn").onclick = () => {
    navigator.clipboard.writeText(currentEmail);
    alert("已复制！");
};

// 自动生成一次
createEmail().then(loadInbox);

// 每10秒刷新邮件
setInterval(loadInbox, 10000);
