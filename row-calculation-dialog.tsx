import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { generateYearsList } from '@hooks/use-years-list';
import { Button, Collapse, Typography } from '@mui/material';
import { Box } from '@mui/system';
import styles from './row.scss';
import { RowSections } from './row-calculation-edit';
// import { useLocation } from 'react-router-dom';
import { FormInput } from '@components/form-controls/form-input';
import { useForm } from 'react-hook-form';
import { useProgramConfigurationApi } from '@pages/forecasts/api/progrma-configuration-api';
import { getPasted, clearPasted } from '@components/input';
import { ActiveForecastData } from '@pages/forecasts/api/volume-flow-api';

interface IRowCalculationDialogProps {
  isDisabled: boolean;
  isOpen: boolean;
  closeDialog: Function;
  cardType: string;
  multiplier: string;
  region: string;
  regionOtionsData: any;
  activeForecastItems: ActiveForecastData;
}

const getHeaders = (startYear: number, endYear: number) => {
  let headers = ['Key Geography', 'Brand List', 'Metric'];
  const yearlist = generateYearsList({ includeHistoricalYears: false, startYear, endYear });
  return [...headers, ...yearlist];
};

// const getTitle = (cardType: string) => {
//   if (cardType === RowSections.ORIGINATOR_VOLUME) return 'Originator Volume';
//   if (cardType === RowSections.ORIGINATOR_PRICE) return 'Originator Price';
//   if (cardType === RowSections.SANDOZ_VOLUME) return 'Sandoz Volume';
//   if (cardType === RowSections.SANDOZ_PRICE) return 'Sandoz Price';
//   return '';
// };

// helper methods (unchanged)
const getYearValues = (regionOtionsData: any, metricType: string, year: any, index: any) => {
  let defaultVal = '0';
  let rawData: any[] = [];

  if (metricType === 'Originator Market size (after events) (KGs)') {
    rawData = regionOtionsData?.originatorMarketSizeAfterEvents?.[0] || [];
  } else if (metricType === 'Originator Market size (KGs)') {
    rawData = regionOtionsData?.originatorMarketSizes?.[0] || [];
  }

  if (Array.isArray(rawData) && rawData.length && index < 2) {
    const filteredYear = rawData.find((e: any) => e.year == year);
    return filteredYear?.value ?? defaultVal;
  }

  return defaultVal;
};

const getOrgPriceValues = (regionOtionsData: any, metricType: string, year: any, index: any) => {
  let defaultVal = '0';
  let rawData: any = [];
  if (metricType === 'Originator ex-factory list price/gram, USD (post price evolution)') {
    rawData = regionOtionsData?.originatorExFactoryPrices[0];
  }
  if (rawData.length && index < 2) {
    let filteredYear = rawData?.filter((e: any) => e.year == year);
    return filteredYear[0].price;
  }
  return defaultVal;
};

const getSandozvolumes = (regionOtionsData: any, metricType: string, year: any, index: any) => {
  let defaultVal = '0';
  let rawData: any = [];
  if (metricType === 'Sandoz Volume (KGs)') {
    rawData = regionOtionsData?.sandozVolume[0];
  }
  if (rawData.length && index < 2) {
    let filteredYear = rawData?.filter((e: any) => e.year == year);
    return filteredYear[0].value;
  }
  return defaultVal;
};

const getSandozPrices = (regionOtionsData: any, metricType: string, year: any, index: any) => {
  let defaultVal = '0';
  let rawData: any = [];
  if (metricType === 'Sandoz net price/gram, USD') {
    rawData = regionOtionsData?.sandozNetPrices[0];
  }
  if (rawData.length && index < 2) {
    let filteredYear = rawData?.filter((e: any) => e.year == year);
    return filteredYear[0].price;
  }
  return defaultVal;
};

const getDefault = (
  cardType: string,
  headers: any[],
  multiplier: string,
  region: string,
  programName: string,
  regionOtionsData: any
) => {
  if (cardType === RowSections.ORIGINATOR_VOLUME) {
    const metricTypes = [
      'Originator Market size (KGs)',
      'Originator Market size (after events) (KGs)',
      'RoW ORG volume factor (%)',
      'Originator Market size (KGs)',
      'Originator Market size (after events) (KGs)'
    ];
    const ar = [0, 1, 2, 3, 4].map((item: number) => {
      return headers.map((it: string | number, index: number) => {
        if (index == 0) {
          if (item == 0 || item == 1) {
            return {
              key: it,
              value: multiplier
            };
          }
          return {
            key: it,
            value: region
          };
        }
        if (index == 1) {
          return {
            key: it,
            value: programName
          };
        }
        if (index == 2) {
          return {
            key: it,
            value: metricTypes[item]
          };
        }
        return {
          key: it,
          value: getYearValues(regionOtionsData, metricTypes[item], it, item)
        };
      });
    });
    return ar;
  } else if (cardType === RowSections.ORIGINATOR_PRICE) {
    const metricTypes = [
      'Originator ex-factory list price/gram, USD (post price evolution)',
      'RoW ORG price factor (%)',
      'Originator ex-factory list price/gram, USD (post price evolution)'
    ];
    const ar = [0, 1, 2].map((item: number) => {
      return headers.map((it: string | number, index: number) => {
        if (index == 0) {
          if (item == 0) {
            return {
              key: it,
              value: multiplier
            };
          }
          return {
            key: it,
            value: region
          };
        }
        if (index == 1) {
          return {
            key: it,
            value: programName
          };
        }
        if (index == 2) {
          return {
            key: it,
            value: metricTypes[item]
          };
        }
        return {
          key: it,
          value: getOrgPriceValues(regionOtionsData, metricTypes[item], it, item)
        };
      });
    });
    return ar;
  } else if (cardType === RowSections.SANDOZ_VOLUME) {
    const metricTypes = ['Sandoz Volume (KGs)', 'RoW Sandoz volume factor (%)', 'Sandoz volume (KGs)'];
    const ar = [0, 1, 2].map((item: number) => {
      return headers.map((it: string | number, index: number) => {
        if (index == 0) {
          if (item == 0) {
            return {
              key: it,
              value: multiplier
            };
          }
          return {
            key: it,
            value: region
          };
        }
        if (index == 1) {
          return {
            key: it,
            value: programName
          };
        }
        if (index == 2) {
          return {
            key: it,
            value: metricTypes[item]
          };
        }
        return {
          key: it,
          value: getSandozvolumes(regionOtionsData, metricTypes[item], it, item)
        };
      });
    });
    return ar;
  } else if (cardType === RowSections.SANDOZ_PRICE) {
    const metricTypes = ['Sandoz net price/gram, USD', 'RoW Sandoz price factor (%)', 'Sandoz net price/gram, USD'];
    const ar = [0, 1, 2].map((item: number) => {
      return headers.map((it: string | number, index: number) => {
        if (index == 0) {
          if (item == 0) {
            return {
              key: it,
              value: multiplier
            };
          }
          return {
            key: it,
            value: region
          };
        }
        if (index == 1) {
          return {
            key: it,
            value: programName
          };
        }
        if (index == 2) {
          return {
            key: it,
            value: metricTypes[item]
          };
        }
        return {
          key: it,
          value: getSandozPrices(regionOtionsData, metricTypes[item], it, item)
        };
      });
    });
    return ar;
  }
  return [];
};

export const RowCalculationDialog = ({
  isDisabled,
  isOpen,
  closeDialog,
  cardType,
  multiplier,
  region,
  regionOtionsData,
  activeForecastItems
}: IRowCalculationDialogProps) => {
  // const paramData = useLocation();
  // const activeForecastItems = JSON.parse(JSON.stringify(paramData['state']));
  const { startYear, endYear } = activeForecastItems;
  const headers = React.useMemo(() => getHeaders(startYear, endYear), []);
  const defaultValues = React.useMemo(
    () => getDefault(cardType, headers, multiplier, region, activeForecastItems.brandName ?? '', regionOtionsData),
    [regionOtionsData]
  );
  const [rows, setRows] = useState(defaultValues);
  const {
    postOriginatorVolume,
    postOriginatorPrice,
    postRowSandozVolume,
    postRowSandozPrice,
    getRowOriginatorVolume,
    getRowOriginatorPrice,
    getRowSandozVolume,
    getRowSandozPrice
  } = useProgramConfigurationApi();
  const { control } = useForm<any>({
    reValidateMode: 'onSubmit'
  });

  const rowOnchangeCalc = (event: any, idxVal: any, item: any, cellId: any) => {
    const newUpdatedRows = [...rows];

    const val = getPasted() ? getPasted() : event.target.value;
    clearPasted();

    const isMultiline =
      val
        .toString()
        ?.trim()
        ?.split('---')
        .filter((ele: any) => ele.length >= 1).length > 1;
    if (isMultiline) {
      const valueMatrix = val
        .toString()
        .trim()
        .split('---')
        .map((ele: any) => ele.split('___'));
      const currentnewRow = rows[idxVal].map((rowItem: any, index: any) => {
        if (index >= cellId) {
          if (valueMatrix[0][index - cellId] != null) {
            return {
              ...rowItem,
              value: valueMatrix[0][index - cellId]
            };
          } else {
            return rowItem;
          }
        }
        return rowItem;
      });
      if (idxVal == 1 && cardType != 'Originator Volume') {
        const currentnextFirstRow = rows[idxVal + 1].map((rowItem: any, index: any) => {
          if (index >= cellId) {
            if (valueMatrix[0][index - cellId] != null) {
              const multiplier =
                rows[idxVal - 1][index].value != null && String(rows[idxVal - 1][index].value) != ''
                  ? Number(rows[idxVal - 1][index].value)
                  : 0;

              return {
                ...rowItem,
                value: ((Number(valueMatrix[0][index - cellId]) / 100) * multiplier).toFixed(2)
              };
            } else {
              return rowItem;
            }
          }
          return rowItem;
        });

        newUpdatedRows[idxVal + 1] = currentnextFirstRow;
      }

      if (idxVal == 2 && cardType == 'Originator Volume') {
        const currentnextFirstRow = rows[idxVal + 1].map((rowItem: any, index: any) => {
          if (index >= cellId) {
            if (valueMatrix[0][index - cellId] != null) {
              const multiplier =
                rows[idxVal - 2][index].value != null && String(rows[idxVal - 2][index].value) != ''
                  ? Number(rows[idxVal - 2][index].value)
                  : 0;

              return {
                ...rowItem,
                value: ((Number(valueMatrix[0][index - cellId]) / 100) * multiplier).toFixed(2)
              };
            } else {
              return rowItem;
            }
          }
          return rowItem;
        });

        const currentnextSecondRow = rows[idxVal + 2].map((rowItem: any, index: any) => {
          if (index >= cellId) {
            if (valueMatrix[0][index - cellId] != null) {
              const multiplier =
                rows[idxVal - 1][index].value != null && String(rows[idxVal - 1][index].value) != ''
                  ? Number(rows[idxVal - 1][index].value)
                  : 0;

              return {
                ...rowItem,
                value: ((Number(valueMatrix[0][index - cellId]) / 100) * multiplier).toFixed(2)
              };
            } else {
              return rowItem;
            }
          }
          return rowItem;
        });
        newUpdatedRows[idxVal + 1] = currentnextFirstRow;
        newUpdatedRows[idxVal + 2] = currentnextSecondRow;
      }

      newUpdatedRows[idxVal] = currentnewRow;

      setRows(newUpdatedRows);
    } else {
      const valueMatrix = val.toString().trim().split('___');
      if (typeof valueMatrix == 'object') {
        const currentnewRow = rows[idxVal].map((rowItem: any, index: any) => {
          if (index >= cellId) {
            if (valueMatrix[index - cellId] != null) {
              return {
                ...rowItem,
                value: valueMatrix[index - cellId]
              };
            } else {
              return rowItem;
            }
          }
          return rowItem;
        });
        if (idxVal == 1 && cardType != 'Originator Volume') {
          const currentnextFirstRow = rows[idxVal + 1].map((rowItem: any, index: any) => {
            if (index >= cellId) {
              if (valueMatrix[index - cellId] != null) {
                const multiplier =
                  rows[idxVal - 1][index].value != null && String(rows[idxVal - 1][index].value) != ''
                    ? Number(rows[idxVal - 1][index].value)
                    : 0;

                return {
                  ...rowItem,
                  value: ((Number(valueMatrix[index - cellId]) / 100) * multiplier).toFixed(2)
                };
              } else {
                return rowItem;
              }
            }
            return rowItem;
          });

          newUpdatedRows[idxVal + 1] = currentnextFirstRow;
        }

        if (idxVal == 2 && cardType == 'Originator Volume') {
          const currentnextFirstRow = rows[idxVal + 1].map((rowItem: any, index: any) => {
            if (index >= cellId) {
              if (valueMatrix[index - cellId] != null) {
                const multiplier =
                  rows[idxVal - 2][index].value != null && String(rows[idxVal - 2][index].value) != ''
                    ? Number(rows[idxVal - 2][index].value)
                    : 0;

                return {
                  ...rowItem,
                  value: ((Number(valueMatrix[index - cellId]) / 100) * multiplier).toFixed(2)
                };
              } else {
                return rowItem;
              }
            }
            return rowItem;
          });

          const currentnextSecondRow = rows[idxVal + 2].map((rowItem: any, index: any) => {
            if (index >= cellId) {
              if (valueMatrix[index - cellId] != null) {
                const multiplier =
                  rows[idxVal - 1][index].value != null && String(rows[idxVal - 1][index].value) != ''
                    ? Number(rows[idxVal - 1][index].value)
                    : 0;

                return {
                  ...rowItem,
                  value: ((Number(valueMatrix[index - cellId]) / 100) * multiplier).toFixed(2)
                };
              } else {
                return rowItem;
              }
            }
            return rowItem;
          });
          newUpdatedRows[idxVal + 1] = currentnextFirstRow;
          newUpdatedRows[idxVal + 2] = currentnextSecondRow;
        }

        newUpdatedRows[idxVal] = currentnewRow;

        setRows(newUpdatedRows);
      } else {
        if (cardType === 'Originator Volume') {
          let firstRow = rows[idxVal - 2];
          let secondRow = rows[idxVal - 1];
          let currentRow = rows[idxVal];
          let fourthRow = rows[idxVal + 1];
          let fifthRow = rows[idxVal + 2];
          const updatedVal = event?.target?.value;
          const firstCalcItem = firstRow?.filter((e: any) => e.key == item.key);
          const secCalcItem = secondRow?.filter((e: any) => e.key == item.key);

          currentRow?.map((e: any) => {
            if (e.key == item.key) {
              e.value = event.target.value;
            }
            return e;
          });
          fourthRow?.map((e: any) => {
            if (e.key == item.key) {
              e.value = (firstCalcItem[0].value * (updatedVal / 100)).toFixed(2);
            }
            return e;
          });
          fifthRow?.map((e: any) => {
            if (e.key == item.key) {
              e.value = (secCalcItem[0].value * (updatedVal / 100)).toFixed(2);
            }
            return e;
          });

          // rows = [firstRow, secondRow, currentRow, fourthRow, fifthRow];
          setRows([firstRow, secondRow, currentRow, fourthRow, fifthRow]);
        } else {
          let firstRow = rows[idxVal - 1];

          let currentRow = rows[idxVal];
          let thirdRow = rows[idxVal + 1];

          const updatedVal = event?.target?.value;
          const firstCalcItem = firstRow?.filter((e: any) => e.key == item.key);

          currentRow?.map((e: any) => {
            if (e.key == item.key) {
              e.value = event.target.value;
            }
            return e;
          });

          thirdRow?.map((e: any) => {
            if (e.key == item.key) {
              e.value = (firstCalcItem[0]?.value * (updatedVal / 100)).toFixed(2);
            }
            return e;
          });

          // rows = [firstRow, currentRow, thirdRow];
          setRows([firstRow, currentRow, thirdRow]);
        }

        // setRows(rows);
      }
    }
  };

  const makeDisableRows = (row: any) => {
    const metricName = row?.[2]?.value?.toString()?.trim() ?? '';
    // Enable editing only if metric name starts with 'RoW'
    if (metricName.startsWith('RoW')) {
      return false; // editable
    }
    return true; // disable all others
  };

  // const submitRequest = (data:any) => {
  //     console.log("submit data", data)
  //     closeDialog(false);
  //     return data

  // }

  const formSubmitDialog = (rowval: any) => {
    // ROW originator volume
    if (rowval.length && cardType == 'Originator Volume') {
      let rowFormData = {
        country: '',
        programName: '',
        rowOrgvolfactor: [{ year: 0, value: '' }],
        rowOriginatorMarketSize: [{ year: 0, value: '' }],
        rowOriginatorMarketSizeAfter: [{ year: 0, value: '' }],
        traditionalForecastId: 0
      };
      // rowFormData.country = rowval[]
      rowval.forEach((ele: any, i: any) => {
        if (i > 1) {
          rowFormData.country = ele[0].value;
          rowFormData.programName = ele[1].value;
          ele?.forEach((ie: any, l: any) => {
            if (l > 2 && i === 2) {
              // rowFormData.rowOrgvolfactor[0];
              rowFormData.rowOrgvolfactor.push({ year: ie.key, value: ie.value });
              // if(ele.length === i+1) {
              //     rowFormData.rowOrgvolfactor.shift()
              // }
            } else if (l > 2 && i === 3) {
              // rowFormData.rowOrgvolfactor[0];
              rowFormData.rowOriginatorMarketSize.push({ year: ie.key, value: ie.value });
            } else if (l > 2 && i === 4) {
              // rowFormData.rowOrgvolfactor[0];
              rowFormData.rowOriginatorMarketSizeAfter.push({ year: ie.key, value: ie.value });
            }
          });
          activeForecastItems?.traditional_forecast_id
            ? (rowFormData.traditionalForecastId = activeForecastItems?.traditional_forecast_id)
            : 0;
        }
      });
      rowFormData.rowOrgvolfactor.shift();
      rowFormData.rowOriginatorMarketSize.shift();
      rowFormData.rowOriginatorMarketSizeAfter.shift();

      if (rowFormData) {
        let postOriginatorVolumeData: any = postOriginatorVolume(rowFormData);
        console.log(postOriginatorVolumeData);
      }
    }
    // row originator price
    else if (rowval.length && cardType == 'Originator Price') {
      let rowOrgPriceData = {
        country: '',
        programName: 'ProgramName',
        rowOrgpricefactor: [{ year: 0, value: '' }],
        rowOriginatorExfactorPrice: [{ year: 0, value: '' }],
        traditionalForecastId: 0
      };

      rowval.forEach((ele: any, i: any) => {
        if (i > 0) {
          rowOrgPriceData.country = ele[0].value;
          rowOrgPriceData.programName = ele[1].value;
          ele?.forEach((ie: any, l: any) => {
            if (l > 2 && i === 1) {
              // rowFormData.rowOrgvolfactor[0];
              rowOrgPriceData.rowOrgpricefactor.push({ year: ie.key, value: ie.value });
              // if(ele.length === i+1) {
              //     rowFormData.rowOrgvolfactor.shift()
              // }
            } else if (l > 2 && i === 2) {
              // rowFormData.rowOrgvolfactor[0];
              rowOrgPriceData.rowOriginatorExfactorPrice.push({ year: ie.key, value: ie.value });
            }
          });
          activeForecastItems?.traditional_forecast_id
            ? (rowOrgPriceData.traditionalForecastId = activeForecastItems?.traditional_forecast_id)
            : 0;
        }
      });
      rowOrgPriceData.rowOrgpricefactor.shift();
      rowOrgPriceData.rowOriginatorExfactorPrice.shift();

      if (rowOrgPriceData) {
        let postOriginatorPriceData: any = postOriginatorPrice(rowOrgPriceData);
        console.log(postOriginatorPriceData);
      }
    }

    // ROW sandoz volume
    else if (rowval.length && cardType == 'Sandoz Volume') {
      let rowSandozVolumeData = {
        country: '',
        programName: '',
        rowSandozvolFac: [{ year: 0, value: '' }],
        rowSandozVolume: [{ year: 0, value: '' }],
        traditionalForecastId: 0
      };

      rowval.forEach((ele: any, i: any) => {
        if (i > 0) {
          rowSandozVolumeData.country = ele[0].value;
          rowSandozVolumeData.programName = ele[1].value;
          ele?.forEach((ie: any, l: any) => {
            if (l > 2 && i === 1) {
              // rowFormData.rowOrgvolfactor[0];
              rowSandozVolumeData.rowSandozvolFac.push({ year: ie.key, value: ie.value });
              // if(ele.length === i+1) {
              //     rowFormData.rowOrgvolfactor.shift()
              // }
            } else if (l > 2 && i === 2) {
              // rowFormData.rowOrgvolfactor[0];
              rowSandozVolumeData.rowSandozVolume.push({ year: ie.key, value: ie.value });
            }
          });
          activeForecastItems?.traditional_forecast_id
            ? (rowSandozVolumeData.traditionalForecastId = activeForecastItems?.traditional_forecast_id)
            : 0;
        }
      });
      rowSandozVolumeData.rowSandozvolFac.shift();
      rowSandozVolumeData.rowSandozVolume.shift();

      if (rowSandozVolumeData) {
        let postRowSandozVolData: any = postRowSandozVolume(rowSandozVolumeData);
        console.log(postRowSandozVolData);
      }
    }

    //ROW Sandoz Price
    else if (rowval.length && cardType == 'Sandoz Price') {
      let rowSandozPriceData = {
        country: '',
        programName: '',
        rowSandozpriFac: [{ year: 0, value: '' }],
        rowSandozPrice: [{ year: 0, value: '' }],
        traditionalForecastId: 0
      };

      rowval.forEach((ele: any, i: any) => {
        if (i > 0) {
          rowSandozPriceData.country = ele[0].value;
          rowSandozPriceData.programName = ele[1].value;
          ele?.forEach((ie: any, l: any) => {
            if (l > 2 && i === 1) {
              // rowFormData.rowOrgvolfactor[0];
              rowSandozPriceData.rowSandozpriFac.push({ year: ie.key, value: ie.value });
              // if(ele.length === i+1) {
              //     rowFormData.rowOrgvolfactor.shift()
              // }
            } else if (l > 2 && i === 2) {
              // rowFormData.rowOrgvolfactor[0];
              rowSandozPriceData.rowSandozPrice.push({ year: ie.key, value: ie.value });
            }
          });
          activeForecastItems?.traditional_forecast_id
            ? (rowSandozPriceData.traditionalForecastId = activeForecastItems?.traditional_forecast_id)
            : 0;
        }
      });
      rowSandozPriceData.rowSandozpriFac.shift();
      rowSandozPriceData.rowSandozPrice.shift();

      if (rowSandozPriceData) {
        let postRowSandozVolData: any = postRowSandozPrice(rowSandozPriceData);
        console.log(postRowSandozVolData);
      }
    }

    return rowval;
  };

  const handleGetAllAPiData = async (): Promise<void> => {
    let getOriVolRows = await getRowOriginatorVolume(
      activeForecastItems.traditional_forecast_id ? activeForecastItems.traditional_forecast_id : 61
    );
    let getOriPriceRows = await getRowOriginatorPrice(
      activeForecastItems.traditional_forecast_id ? activeForecastItems.traditional_forecast_id : 61
    );

    let getSandozVolRows = await getRowSandozVolume(
      activeForecastItems.traditional_forecast_id ? activeForecastItems.traditional_forecast_id : 61
    );
    let getSandozPricRows = await getRowSandozPrice(
      activeForecastItems.traditional_forecast_id ? activeForecastItems.traditional_forecast_id : 61
    );

    const newSetRows = [...rows];

    // let currentFourthRow = rows[3];
    // let currentFifthRow = rows[4];
    if (cardType == 'Originator Volume') {
      let currentThirdRow = newSetRows[2];
      let filteredApiValue = getOriVolRows[0]?.data?.filter(
        (rowEle: any) => rowEle.programName == currentThirdRow[1].value && rowEle.country == currentThirdRow[0].value
      );
      if (filteredApiValue.length) {
        filteredApiValue[0].rowOrgvolfactor.forEach((e: any, i: any) => {
          newSetRows[2].map((re: any, rei: any) => {
            if (e.year == re.key) {
              re.value = e.value;
            }
          });
        });
        filteredApiValue[0].rowOriginatorMarketSize.forEach((e: any, i: any) => {
          newSetRows[3].map((re: any, rei: any) => {
            if (e.year == re.key) {
              re.value = e.value;
            }
          });
        });
        filteredApiValue[0].rowOriginatorMarketSizeAfter.forEach((e: any, i: any) => {
          newSetRows[4].map((re: any, rei: any) => {
            if (e.year == re.key) {
              re.value = e.value;
            }
          });
        });
        setRows(newSetRows);
      }
    }

    if (cardType == 'Originator Price') {
      let currentFactorRow = newSetRows[1];
      let filteredApiValue = getOriPriceRows[0]?.data?.filter(
        (rowEle: any) => rowEle.programName == currentFactorRow[1].value && rowEle.country == currentFactorRow[0].value
      );
      if (filteredApiValue.length) {
        filteredApiValue[0].rowOrgpricefactor.forEach((e: any, i: any) => {
          newSetRows[1].map((re: any, rei: any) => {
            if (e.year == re.key) {
              re.value = e.value ?? '';
            }
          });
        });
        filteredApiValue[0].rowOriginatorExfactorPrice.forEach((e: any, i: any) => {
          newSetRows[2].map((re: any, rei: any) => {
            if (e.year == re.key) {
              re.value = e.value ?? '';
            }
          });
        });

        setRows(newSetRows);
      }
    }

    if (cardType == 'Sandoz Price') {
      let currentFactorRow = newSetRows[1];
      let filteredApiValue = getSandozPricRows[0]?.data?.filter(
        (rowEle: any) => rowEle.programName == currentFactorRow[1].value && rowEle.country == currentFactorRow[0].value
      );
      if (filteredApiValue.length) {
        filteredApiValue[0].rowSandozpriFac.forEach((e: any, i: any) => {
          newSetRows[1].map((re: any, rei: any) => {
            if (e.year == re.key) {
              re.value = e.value;
            }
          });
        });
        filteredApiValue[0].rowSandozPrice.forEach((e: any, i: any) => {
          newSetRows[2].map((re: any, rei: any) => {
            if (e.year == re.key) {
              re.value = e.value;
            }
          });
        });

        setRows(newSetRows);
      }
    }

    if (cardType == 'Sandoz Volume') {
      let currentFactorRow = newSetRows[1];
      let filteredApiValue = getSandozVolRows[0]?.data?.filter(
        (rowEle: any) => rowEle.programName == currentFactorRow[1].value && rowEle.country == currentFactorRow[0].value
      );
      if (filteredApiValue.length) {
        filteredApiValue[0].rowSandozvolFac.forEach((e: any, i: any) => {
          newSetRows[1].map((re: any, rei: any) => {
            if (e.year == re.key) {
              re.value = e.value ?? e.price ?? '';
            }
          });
        });
        filteredApiValue[0].rowSandozVolume.forEach((e: any, i: any) => {
          newSetRows[2].map((re: any, rei: any) => {
            if (e.year == re.key) {
              re.value = e.value;
            }
          });
        });

        setRows(newSetRows);
      }
    }
  };

  useEffect(() => {
    handleGetAllAPiData();
  }, []);
  const tableRef = useRef<HTMLDivElement>(null);
  const [colWidths, setColWidths] = useState<number[]>([]);
  useLayoutEffect(() => {
    if (!tableRef.current) return;

    const allCells = tableRef.current.querySelectorAll('[data-col]');
    const widths: number[] = [];

    allCells.forEach((cell: any) => {
      const col = parseInt(cell.dataset.col);
      const w = cell.scrollWidth;
      widths[col] = Math.max(widths[col] || 0, w);
    });

    // Add padding buffer
    setColWidths(widths.map(w => w + 24));
  }, [headers.length]);

  return (
    <Collapse in={isOpen} timeout="auto" unmountOnExit>
      <Box
        sx={{
          border: '1px solid #d0d7dd',
          borderRadius: '8px',
          backgroundColor: '#f7f9fb',
          p: 2,
          mt: 1,
          overflowX: 'auto'
        }}
      >
        {/* <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#002b49' }}>
          {getTitle(cardType)}
        </Typography> */}

        <Box className="custom-table" ref={tableRef} sx={{ minWidth: 'max-content' }}>
          {/* Table Header */}
          <Box
            sx={{
              display: 'flex',
              backgroundColor: '#D9D9D9',
              fontWeight: 700,
              borderBottom: '1px solid #ccc'
            }}
          >
            {headers.map((val, index) => (
              <Box
                key={val}
                data-col={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: colWidths[index] || 'auto',
                  textAlign: 'center',
                  borderRight: '1px solid #ccc'
                }}
              >
                <Typography fontSize="16px">{val}</Typography>
              </Box>
            ))}
          </Box>

          {/* Table Body */}
          {rows.map((element: any, idx: number) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                borderBottom: '1px solid #e1e4e8',
                '&:hover': { backgroundColor: '#f1f4f7' }
              }}
            >
              {element.map((item: any, index: number) => (
                <Box
                  key={item.key + 'Box'}
                  data-col={index}
                  sx={{
                    flexShrink: 0,
                    width: colWidths[index] || 'auto',
                    textAlign: 'center',
                    borderRight: '1px solid #eee',
                    display: index > 2 ? 'flex' : 'block',
                    alignItems: index > 2 ? 'center' : 'unset',
                    justifyContent: index > 2 ? 'center' : 'unset'
                  }}
                >
                  {index <= 2 ? (
                    <Typography fontSize="15px">{item.value}</Typography>
                  ) : (
                    <FormInput
                      control={control}
                      name={`year_${item.key}_${idx}`}
                      className={styles.tableInput}
                      labelName=""
                      useValue={true}
                      value={item.value ?? '0'}
                      isTable={false}
                      onChange={e => rowOnchangeCalc(e, idx, item, index)}
                      disabled={makeDisableRows(element)}
                      sx={{
                        '& input': {
                          border: makeDisableRows(element) ? '1px solid #ccc' : '1px solid black'
                        }
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
      {!isDisabled && (
        <Box display="flex" justifyContent="flex-end" gap="10px" mt={3}>
          <Button
            variant="contained"
            onClick={() => {
              formSubmitDialog(rows);
            }}
            sx={{
              backgroundColor: '#002b49',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#003a63' }
            }}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            onClick={() => closeDialog(false)}
            sx={{ textTransform: 'none', color: '#002b49', borderColor: '#002b49' }}
          >
            Close
          </Button>
        </Box>
      )}
    </Collapse>
  );
};
