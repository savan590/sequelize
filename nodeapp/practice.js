
const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:9443@localhost:5432/user', { logging: false })
// { logging: (...msg) => console.log(msg) }
const { Op } = require('sequelize');
const User = sequelize.define('user', { name: DataTypes.STRING }, { timestamps: false });
const Task = sequelize.define('task', { name: DataTypes.STRING }, { timestamps: false });
const Tool = sequelize.define(
    'tool',
    {
        name: DataTypes.STRING,
        size: DataTypes.STRING,
    },
    { timestamps: false },
);
User.hasMany(Task);
Task.belongsTo(User);
User.hasMany(Tool, { as: 'Instruments' });
(async () => {
    await sequelize.sync({force : true});
    // sequelize.drop()
    // const jane = await User.create({
    //     username: 'janedoe',
    //     birthday: new Date(1980, 6, 20),
    // });
    // jane.update({
    //     username: 'sas',
    // });
    // // As above, the database still has "Jane" and "green"
    // await jane.save();
    // console.log(jane.toJSON());

    // const jane = await User.create({ name: 'Jane', age: 100, cash: 5000,  favoriteColor:'blue' });
    // await jane.increment({
    //     age: 2,
    //     cash: 100,
    // });
    // await jane.increment(['age', 'cash'], { by: 2 });
    // const users = await User.findAll({attributes: ['age', 'cash']});
    // console.log(JSON.stringify(users))


    // const users = await User.findAll({ limit: 5, offset: 3, })
    // console.log(JSON.stringify(users))

    const tasks = await Task.findAll({ include: User });
    console.log(JSON.stringify(tasks, null, 2));
    // const amount = await User.count({
    //     where: {
    //         id: {
    //             [Op.gt]: 5,ss
    //         },
    //     },
    // });
    // console.log(amount)
})();