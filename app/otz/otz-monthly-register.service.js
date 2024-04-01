const dao = require('../../etl-dao');
const Promise = require('bluebird');
const _ = require('lodash');
import { BaseMysqlReport } from '../reporting-framework/base-mysql.report';
import { PatientlistMysqlReport } from '../reporting-framework/patientlist-mysql.report';

export class OtzMonthlyRegisterService {
  getAggregateReport(reportParams) {
    return new Promise(function (resolve, reject) {
      const report = new BaseMysqlReport(
        'otzMonthlyRegisterAggregate',
        reportParams.requestParams
      );

      Promise.join(report.generateReport(), (results) => {
        let result = results.results.results;
        results.size = result ? result.length : 0;
        results.result = result;
        delete results['results'];
        resolve(results);
        //TODO Do some post processing
      }).catch((errors) => {
        reject(errors);
      });
    });
  }

  getPatientListReport(reportParams) {
    console.log('reportParams', reportParams);
    let indicators = [];

    let report = new PatientlistMysqlReport(
      'otzMonthlyRegisterAggregate',
      reportParams
    );

    return new Promise(function (resolve, reject) {
      //TODO: Do some pre processing
      Promise.join(report.generatePatientListReport(indicators), (results) => {
        resolve(results);
      }).catch((errors) => {
        console.error('Error', errors);
        reject(errors);
      });
    });
  }
}
