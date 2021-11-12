const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ApiError = require('../error/ApiError');
const { User, Basket } = require('../models/models');

const generateJWT = (id, email, role) => {
  return jwt.sign(
    { id, email, role },
    process.env.SECRET_KEY,
    { expiresIn: '24h' }
  );
}

class UserController {
  async registration(req, res, next) {
    const {email, password, role} = req.body;
    if (!email || !password) {
      return next(ApiError.badRequest('Некорректный email или password'));
    }
    const candidate = await User.findOne({ where: { email }});
    if (candidate) {
      return next(ApiError.badRequest('Пользователь с данным email уже существует'));
    }

    const hashPassword = await bcrypt.hash(password, 5);
    const user = await User.create({ email, password: hashPassword, role});
    const basket = await Basket.create({ userId: user.id });

    const token = generateJWT(user.id, user.email, user.role);

    return res.json({ token });
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(ApiError.badRequest('Некорректный email или password'));
    }
    const user = await User.findOne({ where: { email }});
    if (!user) {
      return next(ApiError.badRequest('Пользователя не существует'));
    }
    const isAuth = bcrypt.compareSync(password, user.password);
    if (!isAuth) {
      return next(ApiError.badRequest('Неверный пароль'));
    }

    const token = generateJWT(user.id, user.email, user.role);

    return res.json({ token });
  }

  async check(req, res, next) {
    const {id, email, role} = req.user;
    const token = generateJWT(id, email, role);
    return res.json({ token });
  }
}

module.exports = new UserController();