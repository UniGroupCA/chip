import { fs } from 'mz';

import { CHIP_LOGS_DIR, PROJECT_NAME } from '../utils/files';
import {execDetached} from "../utils/processes";
import {readServices} from "../utils/config";
import {log} from "../utils/log";

export const cleanService = async (
    projectName: string,
    serviceName: string,
) => {
    const fileName = `${CHIP_LOGS_DIR}/${projectName}/${serviceName}.log.timestamps`;
    log`Clearing logs for ${serviceName}`;
    execDetached(`> ${fileName}`);
};

export const cleanServices = async (serviceWhitelist?: string[]) => {
    const services = await readServices(serviceWhitelist);
    const serviceNames = services.map(({ name }) => name);

    for (const serviceName of serviceNames) {
        const fileName = `${CHIP_LOGS_DIR}/${PROJECT_NAME}/${serviceName}.log.timestamps`;
        if (await fs.exists(fileName)) {
            cleanService(
                PROJECT_NAME,
                serviceName
            );
        }
    }
};