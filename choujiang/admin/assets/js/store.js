import { api } from './api.js';
import { Prize, User, Department, LotteryRecord } from './models.js';

// 状态管理类
class Store {
    constructor() {
        this.state = {
            prizes: [],
            users: [],
            departments: [],
            records: [],
            settings: null,
            currentUser: null,
            loading: false,
            error: null
        };
        
        this.listeners = new Set();
    }

    // 订阅状态变化
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    // 触发状态更新
    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // 设置状态
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    // 设置加载状态
    setLoading(loading) {
        this.setState({ loading });
    }

    // 设置错误状态
    setError(error) {
        this.setState({ error });
    }

    // 初始化数据
    async init() {
        try {
            this.setLoading(true);
            const [prizes, users, departments, settings] = await Promise.all([
                api.prizes.list(),
                api.users.list(),
                api.departments.list(),
                api.settings.get()
            ]);

            this.setState({
                prizes: prizes.map(p => new Prize(p)),
                users: users.map(u => new User(u)),
                departments: departments.map(d => new Department(d)),
                settings
            });
        } catch (error) {
            this.setError(error);
        } finally {
            this.setLoading(false);
        }
    }

    // 奖品相关方法
    async addPrize(prize) {
        try {
            const newPrize = await api.prizes.create(prize);
            this.setState({
                prizes: [...this.state.prizes, new Prize(newPrize)]
            });
            return newPrize;
        } catch (error) {
            this.setError(error);
            throw error;
        }
    }

    // 用户相关方法
    async updateUser(id, userData) {
        try {
            const updatedUser = await api.users.update(id, userData);
            this.setState({
                users: this.state.users.map(user => 
                    user.id === id ? new User(updatedUser) : user
                )
            });
            return updatedUser;
        } catch (error) {
            this.setError(error);
            throw error;
        }
    }

    // 部门相关方法
    async deleteDepartment(id) {
        try {
            await api.departments.delete(id);
            this.setState({
                departments: this.state.departments.filter(dept => dept.id !== id)
            });
        } catch (error) {
            this.setError(error);
            throw error;
        }
    }

    // 设置相关方法
    async updateSettings(settings) {
        try {
            const updatedSettings = await api.settings.update(settings);
            this.setState({ settings: updatedSettings });
            return updatedSettings;
        } catch (error) {
            this.setError(error);
            throw error;
        }
    }

    // 抽奖记录相关方法
    async addRecord(record) {
        try {
            const newRecord = await api.records.create(record);
            this.setState({
                records: [new LotteryRecord(newRecord), ...this.state.records]
            });
            return newRecord;
        } catch (error) {
            this.setError(error);
            throw error;
        }
    }
}

// 创建并导出单例
export const store = new Store(); 