// 用于为所有没有密码的用户补全默认密码（加密后）
import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { password: "" } });
  for (const user of users) {
    // 这里设置默认密码为 '123456'，实际可根据需要修改
    const hash = await bcrypt.hash("123456", 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash },
    });
    console.log(`用户 ${user.email} 密码已补全`);
  }
  if (users.length === 0) {
    console.log("所有用户都已设置密码");
  }
}

main().finally(() => prisma.$disconnect());
