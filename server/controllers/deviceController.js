const uuid = require('uuid');
const path = require('path');

const { Device, DeviceInfo } = require('../models/models');
const ApiError = require('../error/ApiError');

class DeviceController {
  async create(req, res, next) {
    try {
      const { name, price, brandId, typeId, info } = req.body;
      const { img } = req.files;
      const filename = `${uuid.v4()}.jpg`;
      img.mv(path.resolve(__dirname, '..', 'static', filename));

      const device = await Device.create({ name, price, brandId, typeId, img: filename });

      if (info) {
        const infoArray = JSON.parse();
        infoArray.forEach(({ title, description }) => {
          DeviceInfo.create({
            title,
            description,
            deviceId: device.id
          });
        });
      }

      return res.json(device);
    } catch(e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getAll(req, res) {
    const { brandId, typeId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let devices = [];
    if (!brandId && !typeId) {
      devices = await Device.findAndCountAll({ offset, limit });
    } else if (!brandId && typeId) {
      devices = await Device.findAndCountAll({ where: { typeId }, offset, limit});
    } else if (brandId && !typeId) {
      devices = await Device.findAndCountAll({ where: { brandId }, offset, limit});
    } else {
      devices = await Device.findAndCountAll({ where: { typeId, brandId }, offset, limit});
    }
    return res.json(devices);
  }

  async getOne(req, res) {
    const { id } = req.params;
    const device = await Device.findOne({
      where: { id },
      include: [
        {model: DeviceInfo, as: 'info'}
      ]
    });
    return res.json(device);
  }
}

module.exports = new DeviceController();