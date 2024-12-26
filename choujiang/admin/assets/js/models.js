// 基础模型类
class BaseModel {
    constructor(data = {}) {
        this.id = data.id;
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    }

    toJSON() {
        return {
            id: this.id,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }
}

// 奖品模型
export class Prize extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.name = data.name || '';
        this.type = data.type || '';
        this.description = data.description || '';
        this.image = data.image || '';
        this.count = data.count || 0;
        this.remaining = data.remaining ?? (data.count || 0);
        this.value = data.value || 0;
        this.order = data.order || 0;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            name: this.name,
            type: this.type,
            description: this.description,
            image: this.image,
            count: this.count,
            remaining: this.remaining,
            value: this.value,
            order: this.order
        };
    }
}

// 用户模型
export class User extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.number = data.number || '';
        this.name = data.name || '';
        this.department = data.department || '';
        this.position = data.position || '';
        this.avatar = data.avatar || '';
        this.participateLottery = data.participateLottery ?? true;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            number: this.number,
            name: this.name,
            department: this.department,
            position: this.position,
            avatar: this.avatar,
            participateLottery: this.participateLottery
        };
    }
}

// 部门模型
export class Department extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.name = data.name || '';
        this.code = data.code || '';
        this.parent = data.parent || null;
        this.order = data.order || 0;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            name: this.name,
            code: this.code,
            parent: this.parent,
            order: this.order
        };
    }
}

// 抽奖记录模型
export class LotteryRecord extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.prizeId = data.prizeId;
        this.userId = data.userId;
        this.prizeName = data.prizeName || '';
        this.userName = data.userName || '';
        this.userDepartment = data.userDepartment || '';
        this.timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    }

    toJSON() {
        return {
            ...super.toJSON(),
            prizeId: this.prizeId,
            userId: this.userId,
            prizeName: this.prizeName,
            userName: this.userName,
            userDepartment: this.userDepartment,
            timestamp: this.timestamp.toISOString()
        };
    }
} 