import fs from 'fs';
import path from 'path';

function fixUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const prefixMatch = url.match(/^(postgres(?:ql)?:\/\/)(.*)$/);
  if (!prefixMatch) return url;
  
  const prefix = prefixMatch[1];
  const rest = prefixMatch[2];
  
  const mainPartMatch = rest.match(/^([^/?]+)(.*)$/);
  if (!mainPartMatch) return url;
  
  const mainPart = mainPartMatch[1];
  const optionsPart = mainPartMatch[2];
  
  const lastAt = mainPart.lastIndexOf('@');
  if (lastAt === -1) return url;
  
  const credentials = mainPart.substring(0, lastAt);
  const hostPort = mainPart.substring(lastAt + 1);
  
  const firstColon = credentials.indexOf(':');
  if (firstColon === -1) return url;
  
  const username = credentials.substring(0, firstColon);
  const password = credentials.substring(firstColon + 1);
  
  try {
    const decodedPassword = decodeURIComponent(password);
    const encodedPassword = encodeURIComponent(decodedPassword);
    return `${prefix}${username}:${encodedPassword}@${hostPort}${optionsPart}`;
  } catch (e) {
    return url;
  }
}

const targetFile = path.resolve('node_modules/prisma/build/index.js');
if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  
  const injection = `
// --- BEGIN DATABASE_URL ESCAPING WRAPPER ---
(function() {
  function fixUrl(url) {
    if (!url || typeof url !== 'string') return url;
    const prefixMatch = url.match(/^(postgres(?:ql)?:\\/\\/)(.*)$/);
    if (!prefixMatch) return url;
    const prefix = prefixMatch[1];
    const rest = prefixMatch[2];
    const mainPartMatch = rest.match(/^([^/?]+)(.*)$/);
    if (!mainPartMatch) return url;
    const mainPart = mainPartMatch[1];
    const optionsPart = mainPartMatch[2];
    const lastAt = mainPart.lastIndexOf('@');
    if (lastAt === -1) return url;
    const credentials = mainPart.substring(0, lastAt);
    const hostPort = mainPart.substring(lastAt + 1);
    const firstColon = credentials.indexOf(':');
    if (firstColon === -1) return url;
    const username = credentials.substring(0, firstColon);
    const password = credentials.substring(firstColon + 1);
    try {
      const decodedPassword = decodeURIComponent(password);
      const encodedPassword = encodeURIComponent(decodedPassword);
      return prefix + username + ':' + encodedPassword + '@' + hostPort + optionsPart;
    } catch (e) {
      return url;
    }
  }
  if (process.env.DATABASE_URL) {
    process.env.DATABASE_URL = fixUrl(process.env.DATABASE_URL);
  }
  if (process.env.SHADOW_DATABASE_URL) {
    process.env.SHADOW_DATABASE_URL = fixUrl(process.env.SHADOW_DATABASE_URL);
  }
})();
// --- END DATABASE_URL ESCAPING WRAPPER ---
`;

  if (!content.includes('BEGIN DATABASE_URL ESCAPING WRAPPER')) {
    content = injection + '\n' + content;
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Successfully injected DATABASE_URL escaping wrapper into node_modules/prisma/build/index.js');
  } else {
    console.log('DATABASE_URL escaping wrapper already injected.');
  }
} else {
  console.error('Could not find node_modules/prisma/build/index.js to patch!');
}
