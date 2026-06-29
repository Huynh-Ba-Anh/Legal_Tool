const cron = require('node-cron');
const { spawnSync } = require('child_process');
const path = require('path');
const HhvStock = require('../models/HhvStock');

const runHhvCrawler = async () => {
    try {
        const projectRoot = path.join(__dirname, '..');
        const pythonPath = path.join(projectRoot, '.venv', 'bin', 'python');
        const scriptPath = path.join(projectRoot, 'cron', 'crawl_hhv.py');

        const result = spawnSync(pythonPath, [scriptPath], {
            cwd: projectRoot,
            encoding: 'utf8',
        });

        if (result.status !== 0) {
            console.error('❌ [HHV Crawler] Lỗi:', result.stderr || 'Lỗi không xác định');
            return;
        }

        const jsonData = JSON.parse(result.stdout);

        if (jsonData && Array.isArray(jsonData) && jsonData.length > 0) {
            await HhvStock.deleteMany({});

            const dataToSave = jsonData.map((item) => ({
                ...item,
                time: new Date(item.time),
            }));

            const savedData = await HhvStock.insertMany(dataToSave);
            console.log(`✅ [HHV Crawler] Lưu thành công ${savedData.length} bản ghi HHV vào database`);
            return savedData;
        } else {
            console.log('⚠️ [HHV Crawler] Không có dữ liệu HHV mới để lưu');
        }

        return null;
    } catch (err) {
        console.error('❌ [HHV Crawler] Lỗi:', err.message);
        return null;
    }
};

const startHhvScheduler = () => {

    cron.schedule('*/30 9-16 * * 1-5', () => {
        runHhvCrawler();
    });

};

module.exports = { runHhvCrawler, startHhvScheduler };
