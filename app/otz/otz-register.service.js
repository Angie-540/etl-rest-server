const Promise = require('bluebird');
const _ = require('lodash');
import { MultiDatasetPatientlistReport } from '../reporting-framework/multi-dataset-patientlist.report';
import ReportProcessorHelpersService from '../reporting-framework/report-processor-helpers.service';

export class OtzRegisterService extends MultiDatasetPatientlistReport {
  constructor(reportName, params) {
    super(reportName, params);
  }

  generateReport(additionalParams) {
    const that = this;
    return new Promise((resolve, reject) => {
      super
        .generateReport(additionalParams)
        .then((results) => {
          if (additionalParams && additionalParams.type === 'patient-list') {
            resolve(results);
          } else {
            let finalResult = [];
            const reportProcessorHelpersService = new ReportProcessorHelpersService();
            for (let result of results) {
              if (
                result.report &&
                result.report.reportSchemas &&
                result.report.reportSchemas.main &&
                result.report.reportSchemas.main.transFormDirectives.joinColumn
              ) {
                finalResult = reportProcessorHelpersService.joinDataSets(
                  that.params[
                    result.report.reportSchemas.main.transFormDirectives
                      .joinColumnParam
                  ] ||
                    result.report.reportSchemas.main.transFormDirectives
                      .joinColumn,
                  finalResult,
                  result.results.results.results
                );
              }
            }

            resolve({
              queriesAndSchemas: results,
              result: finalResult,
              sectionDefinitions: retentionSectionDefs,
              indicatorDefinitions: []
            });
          }
        })
        .catch((error) => {
          console.error('Retention generation error: ', error);
          reject(error);
        });
    });
  }

  getPatientListReport(reportParams) {
    let self = this;
    return new Promise((resolve, reject) => {
      super
        .generatePatientListReport([])
        .then((results) => {
          let result = results.result;
          results['results'] = {
            results: result
          };
          delete results['result'];
          resolve(results);
        })
        .catch((err) => {
          console.error('MOH patient list generation error', err);
          reject(err);
        });
    });
  }

  getIndicatorDefinitions() {
    return new Promise((resolve, reject) => {
      if (retentionIndicators['indicators']) {
        resolve(retentionIndicators['indicators']);
      } else {
        reject('Error: Retention Indicators not found');
      }
    });
  }
}
