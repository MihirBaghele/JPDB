import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectDosingCalculations, selectSavedIndications } from '@store/selectors';
import { patientFlowActions } from '@store/patient-flow-slice';
import sortBy from 'lodash/sortBy';
import TableComponent from '@pages/forecasts/components/table';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { DosingCalculations } from '@pages/forecasts/components/indicators/dosing-calculations';
import { TotalKgOriginatorProductConsumedIndicator } from '@pages/forecasts/components/indicators/total-kg-originator-product-consumed-indicator';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import {
  DiagnoseDataList,
  DiagnosePlaceholder,
  DosingCalculationsInterface,
  IndicationsKeyDict,
  Prevalence,
  SavedIndicationGroup,
  Store,
  TotalKgOfOriginatorProductConsumedInterface
} from '@pages/typings/general-types';

import useInitPatientFlowState from '@store/init-patient-flow-state';

import { UsePatientFlowApi } from '@pages/forecasts/api/traditional-forecast-api';
import { useYearsList } from '@hooks/use-years-list';
import { useNavigate } from 'react-router';
import RoutesPaths from '@routes/routes-paths';
import { MarketProjectionType, OriginatorModel, useVolumeFlowApi } from '@pages/forecasts/api/volume-flow-api';
import { useQuery } from 'react-query';
import { AxiosError } from 'axios';
import FormDropDown from '@components/form-controls/form-dropdown';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { useProgramConfigurationApi } from '@pages/forecasts/api/progrma-configuration-api';
import Input from '@components/input';
import { MainTableRowItem } from '@pages/forecasts/components/table/table';

export const EpidemiologyInput = (): React.ReactElement => {
  let Traditional_id_arr: any = [];
  const param = useLocation();
  let activeForecastItems1 = JSON.parse(JSON.stringify(param['state']));
  const [years] = useYearsList(5, activeForecastItems1);
  const dispatch = useDispatch();
  const { initIndicatorsGroup } = useInitPatientFlowState();
  const savedIndications = useSelector(selectSavedIndications);
  const {
    savePatientEpidemiologyData,
    getNewEpidemSavedData,
    getEstimatedTreatmentData,
    savePatientPrevalenceData,
    savePatientDiagnoseTreatedData
  } = UsePatientFlowApi();
  const { getMultipleForecastId } = useProgramConfigurationApi();
  const [, setMultiGeoName] = useState<any>('');
  const { addOriginatorEvent, updateOriginatorEvent, getOriginatorEvent } = useVolumeFlowApi();
  const [prevalenceTab, setPrevalenceTab] = useState(false);
  const [diagnoseTab, setDiagnoseTab] = useState(false);
  const [estimateTreatedTab, setEstimateTreatedTab] = useState(false);
  const [targetPopulationTab, setTargetPopulationTab] = useState(false);
  const [marketSplitTab, setMarketSplitTab] = useState(false);
  const [focusedMoleculeTab, setFocusedMoleculeTab] = useState(false);

  const [epidemiologyId, setEpidemiologyId] = useState<number>(0);

  const [prevalenceTableData, setPrevalenceTableData] = useState<MainTableRowItem[]>([]);
  const [diagnoseTableData, setDiagnoseTableData] = useState<MainTableRowItem[]>([]);
  const [diagnoseLabelDataList, setDiagnoseLabelDataList] = useState<Prevalence[]>([]);
  const [estimatedTreatedPatientTableData, setEstimatedTreatedPatientTableData] = useState<MainTableRowItem[]>([]);
  const [targetPopulationTableData, setTargetPopulationTableData] = useState<MainTableRowItem[]>([]);
  const [targetPopulationPercentageTableData, setTargetPopulationPercentageTableData] = useState<MainTableRowItem[]>(
    []
  );
  const [marketSplitPercentageTableData, setMarketSplitPercentageTableData] = useState<MainTableRowItem[]>([]);
  const [marketPatientsTableData, setMarketPatientsTableData] = useState<MainTableRowItem[]>([]);
  
  // 🆕 New states for Focused Molecule
  const [focusedMoleculeTableData, setFocusedMoleculeTableData] = useState<MainTableRowItem[]>([]);
  const [focusedMoleculeSelections, setFocusedMoleculeSelections] = useState<{rowIndex: number, selectedLabel: string}[]>([]);

  const [diagnosePlaceholderList, setDiagnosePlaceholderList] = useState<DiagnosePlaceholder[]>([]);
  const [dosingTab, setDosingTab] = useState(false);
  const [NewDataCal, setNewDataCal] = useState<any>('');
  
  const addRowButtonStyle = {
    textTransform: 'none',
    fontSize: '14px',
    borderRadius: '6px',
    padding: '8px',
    backgroundColor: '#2c3e50',
    borderColor: '#2c3e50',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#253544',
      borderColor: '#25354',
      color: '#fff'
    }
  };
  const prevArr: MainTableRowItem[] = [];
  const diagnoseArr: DiagnosePlaceholder[] = [];

  const getYearValueData = (): TotalKgOfOriginatorProductConsumedInterface[] => {
    return years.map(year => {
      const yearData = {
        year: year,
        value: 0
      };
      return yearData;
    });
  };

  const prevalenceRow = (
    prevalence: Prevalence,
    indicatorType: string,
    isReadOnly: boolean,
    prevIndex?: number,
    placeholderType?: number
  ): MainTableRowItem => {
    return {
      key: `row-${prevalence.id ?? prevIndex}`,
      cellItems: [
        {
          key: 'cell-event-name',
          content: (
            <Box
              display="flex"
              alignItems="center"
              sx={{
                position: 'sticky',
                left: 0,
                bgcolor: '#fff',
                zIndex: 2,
                width: '100%'
              }}
            >
              <Input
                sx={{
                  width: '55%'
                }}
                type="text"
                variant="outlined"
                value={prevalence.label}
                inputProps={{ readOnly: isReadOnly }}
                onChange={(e: any) => {
                  if (IndicationsKeyDict.DIAGNOSED_AND_TREATED_POPULATION == indicatorType) {
                    dispatch(
                      patientFlowActions.setDiagnoseTreatmentLabel({
                        label: e.target.value,
                        prevId: prevalence.id,
                        placeholderType
                      })
                    );
                  }
                  if (IndicationsKeyDict.PREVALENCE == indicatorType) {
                    dispatch(
                      patientFlowActions.setPrevalenceLabel({
                        label: e.target.value,
                        indicatorType,
                        prevId: prevalence.id
                      })
                    );
                  }
                }}
                labelName=""
              />
            </Box>
          )
        },
        ...years.map((year, indx) => ({
          key: `cell-${prevalence?.label}-${year}`,
          content: (
            <Input
              type="number"
              variant="outlined"
              labelName=""
              inputProps={{ readOnly: isReadOnly }}
              value={prevalence.indicators[indx].value ?? 0}
              onChange={(e: any) => {
                if (IndicationsKeyDict.DIAGNOSED_AND_TREATED_POPULATION == indicatorType) {
                  dispatch(
                    patientFlowActions.setDiagnosisTreatmentValue({
                      prevId: prevalence.id,
                      indx,
                      year,
                      value: e.target.value,
                      placeholderType
                    })
                  );
                } else {
                  dispatch(
                    patientFlowActions.setPrevalenceValue({
                      prevId: prevalence.id,
                      indx,
                      year,
                      value: e.target.value,
                      indicatorType
                    })
                  );
                }
              }}
            />
          )
        }))
      ]
    };
  };

  const savePrevalence = () => {
    savePatientPrevalenceData(activeForecastItems1.traditional_forecast_id as number).then((res: any) => {
      setEpidemiologyId(res[0].data?.epidemiologyId as number);
      dispatch(patientFlowActions.setEpidemiologyId({ value: res[0].data.epidemiologyId || 0 }));
    });
  };
  
  const saveDiagnosisTreatment = async () => {
    try {
      await savePatientDiagnoseTreatedData(
        activeForecastItems1.traditional_forecast_id as number,
        epidemiologyId as number
      );
      let estimatedTreatmentResult: Prevalence[] = await getEstimatedTreatment();
      let estimatedTreatedData: MainTableRowItem[] = [];
      if (estimatedTreatmentResult[0]) {
        estimatedTreatedData.push(
          prevalenceRow(
            estimatedTreatmentResult[0],
            IndicationsKeyDict.ESTIMATED_TREATED_PATIENTS,
            true,
            estimatedTreatmentResult[0].id as number
          )
        );
      }
    } catch (error) {
      console.log('Error', error);
    }
  };

  // ✅ Add/Remove rows in Market Split
  const addMarketSplitRow = () => {
    if (marketSplitPercentageTableData.length < 20) {
      let marketSplitInitObj = {
        id: Math.floor(Math.random() * 10000) + 1,
        label: `Row ${marketSplitPercentageTableData.length + 1 || 1}`,
        indicators: getYearValueData()
      };

      const newMarketSplitRow = prevalenceRow(
        marketSplitInitObj,
        IndicationsKeyDict.MARKET_SPLIT,
        false,
        marketSplitPercentageTableData.length
      );
      setMarketSplitPercentageTableData([...marketSplitPercentageTableData, newMarketSplitRow]);
      const newMarketPercentageRow = prevalenceRow(
        marketSplitInitObj,
        IndicationsKeyDict.MARKET_SPLIT,
        true,
        marketSplitPercentageTableData.length
      );
      setMarketPatientsTableData([...marketPatientsTableData, newMarketPercentageRow]);
      dispatch(patientFlowActions.addNewMarketSplit(marketSplitInitObj));
      
      // 🆕 Add corresponding focused molecule row selection
      const newSelection = {
        rowIndex: focusedMoleculeSelections.length,
        selectedLabel: marketSplitInitObj.label
      };
      setFocusedMoleculeSelections([...focusedMoleculeSelections, newSelection]);
    }
  };
  
  const removeMarketSplitRow = () => {
    if (marketSplitPercentageTableData.length > 1) {
      setMarketSplitPercentageTableData(marketSplitPercentageTableData.slice(0, -1));
      setMarketPatientsTableData(marketPatientsTableData.slice(0, -1));
      setFocusedMoleculeSelections(focusedMoleculeSelections.slice(0, -1));

      dispatch(patientFlowActions.removeMarketSplit({ indx: 0 }));
    }
  };
  
  // ✅ Add/Remove rows in Prevalence
  const addPrevalenceRow = () => {
    if (prevalenceTableData.length < 5) {
      let prevInitObj = {
        id: Math.floor(Math.random() * 10) + 1,
        label: `Row ${prevalenceTableData.length || 1}`,
        indicators: getYearValueData()
      };
      const newPrevRow = prevalenceRow(prevInitObj, IndicationsKeyDict.PREVALENCE, false, prevalenceTableData.length);

      setPrevalenceTableData([...prevalenceTableData, newPrevRow]);
      dispatch(patientFlowActions.addNewPrevalence(prevInitObj));

      setDiagnoseTableData([...prevalenceTableData, newPrevRow]);
      const newEstimateRow = prevalenceRow(
        prevInitObj,
        IndicationsKeyDict.PREVALENCE,
        true,
        prevalenceTableData.length
      );
      setEstimatedTreatedPatientTableData([...estimatedTreatedPatientTableData, newEstimateRow]);
      setTargetPopulationTableData([...prevalenceTableData, newPrevRow]);
      let TargetPopulationResultRow = {
        id: Math.floor(Math.random() * 10) + 1,
        label: 'Total',
        indicators: getYearValueData()
      };
      const targetPopulationPercentageTableRow = prevalenceRow(
        TargetPopulationResultRow,
        IndicationsKeyDict.PREVALENCE,
        true,
        0
      );
      setTargetPopulationPercentageTableData([
        ...prevalenceTableData,
        ...[newEstimateRow, targetPopulationPercentageTableRow]
      ]);
      let prevNewObj: Prevalence = {
        id: Math.floor(Math.random() * 10) + 1,
        label: `Row ${prevalenceTableData.length || 1}`,
        indicators: getYearValueData()
      };
      setDiagnoseLabelDataList([...diagnoseLabelDataList, prevNewObj]);

      for (let index = 0; index < 5; index++) {
        if (diagnosePlaceholderList.length > 1) {
          diagnoseArr[index] = diagnosePlaceholderList[index];
          diagnoseArr[index].labelData = [...diagnoseTableData, newPrevRow];
          dispatch(
            patientFlowActions.setDiagnosisTreatmentList({
              placeholder_type: diagnosePlaceholderList[index].placeholder_type,
              labelData: [...diagnoseTableData, newPrevRow]
            })
          );
        } else {
          dispatch(
            patientFlowActions.setDiagnosisTreatmentList({
              placeholder_type: index + 1,
              labelData: [...diagnoseLabelDataList, prevNewObj]
            })
          );
          diagnoseArr.push({ placeholder_type: index, labelData: [...diagnoseTableData, newPrevRow] });
        }
      }
      setDiagnosePlaceholderList(diagnoseArr);
    }
  };

  const removePrevalenceRow = () => {
    if (prevalenceTableData.length > 1) {
      setPrevalenceTableData(prevalenceTableData.slice(0, -1));
      setDiagnoseTableData(diagnoseTableData.slice(0, -1));

      dispatch(patientFlowActions.removePrevalence({ indx: 0 }));

      diagnosePlaceholderList.forEach((obj: DiagnosePlaceholder) => {
        if (Array.isArray(obj.labelData) && obj.labelData.length > 0) {
          obj.labelData.pop();
        }
      });
      setDiagnosePlaceholderList(diagnosePlaceholderList);
      dispatch(patientFlowActions.removeDiagnoseTreatment({}));
    }
  };

  // 🆕 Generate Focused Molecule table based on Market Split labels and Market Patients data
  const generateFocusedMoleculeTable = () => {
    // Extract labels from Market Split % table
    const marketSplitLabels = marketSplitPercentageTableData.map((row) => {
      const labelCell = row.cellItems[0];
      return labelCell?.content?.props?.children?.props?.value || '';
    });

    const focusedRows: MainTableRowItem[] = focusedMoleculeSelections.map((selection, rowIndex) => {
      // Find the corresponding market patients data for the selected label
      const selectedRowIndex = marketPatientsTableData.findIndex((row) => {
        const labelCell = row.cellItems[0];
        const labelValue = labelCell?.content?.props?.children?.props?.value || '';
        return labelValue === selection.selectedLabel;
      });

      return {
        key: `focused-molecule-row-${rowIndex}`,
        cellItems: [
          {
            key: `focused-label-${rowIndex}`,
            content: (
              <Box
                display="flex"
                alignItems="center"
                sx={{
                  position: 'sticky',
                  left: 0,
                  bgcolor: '#fff',
                  zIndex: 2,
                  width: '100%'
                }}
              >
                <Select
                  value={selection.selectedLabel}
                  onChange={(e: any) => {
                    const newSelections = [...focusedMoleculeSelections];
                    newSelections[rowIndex] = {
                      ...newSelections[rowIndex],
                      selectedLabel: e.target.value
                    };
                    setFocusedMoleculeSelections(newSelections);
                  }}
                  sx={{ width: '100%', minWidth: '150px' }}
                  size="small"
                >
                  {marketSplitLabels.map((label, idx) => (
                    <MenuItem key={idx} value={label}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            )
          },
          ...years.map((year, yearIdx) => {
            // Get the value from the selected market patient row
            let value = 0;
            if (selectedRowIndex !== -1 && marketPatientsTableData[selectedRowIndex]) {
              const yearCell = marketPatientsTableData[selectedRowIndex].cellItems[yearIdx + 1];
              if (yearCell?.content?.props?.value !== undefined) {
                value = yearCell.content.props.value;
              }
            }

            return {
              key: `focused-year-${year}-${rowIndex}`,
              content: (
                <Input
                  type="number"
                  variant="outlined"
                  labelName=""
                  inputProps={{ readOnly: true }}
                  value={value}
                  onChange={() => {}}
                />
              )
            };
          })
        ]
      };
    });

    setFocusedMoleculeTableData(focusedRows);
  };

  const navigate = useNavigate();
  let [tradIdArr, settradIdArr] = useState<any>([]);
  const [geoName, setGeoName] = useState<any>('');
  const { control } = useForm<any>({
    reValidateMode: 'onSubmit'
  });
  
  const isSavedIndication = (type: SavedIndicationGroup): boolean =>
    !!savedIndications.find(item => item.type === type)?.value;

  const epidemiologyInputs = [
    {
      title: IndicationsKeyDict.PREVALENCE,
      route: '#',
      editable: true,
      indicatorType: IndicationsKeyDict.PREVALENCE,
      isSaved: isSavedIndication(IndicationsKeyDict.PREVALENCE),
      onEdit: (): void => {
        setPrevalenceTab((prev: any) => !prev);
      }
    },
    {
      title: 'Diagnosed and Treated Population (%)',
      route: '#',
      editable: true,
      indicatorType: IndicationsKeyDict.DIAGNOSED_AND_TREATED_POPULATION,
      isSaved: isSavedIndication(IndicationsKeyDict.DIAGNOSED_AND_TREATED_POPULATION),
      onEdit: (): void => {
        setDiagnoseTab((prev: any) => !prev);
      }
    },
    {
      title: IndicationsKeyDict.ESTIMATED_TREATED_PATIENTS,
      route: '#',
      editable: true,
      indicatorType: IndicationsKeyDict.ESTIMATED_TREATED_PATIENTS,
      isSaved: isSavedIndication(IndicationsKeyDict.ESTIMATED_TREATED_PATIENTS),
      onEdit: (): void => {
        setEstimateTreatedTab((prev: any) => !prev);
      }
    },
    {
      title: IndicationsKeyDict.TARGET_POPULATION,
      route: '#',
      editable: true,
      indicatorType: IndicationsKeyDict.TARGET_POPULATION,
      isSaved: isSavedIndication(IndicationsKeyDict.TARGET_POPULATION),
      onEdit: (): void => {
        setTargetPopulationTab((prev: any) => !prev);
      }
    },
    {
      title: IndicationsKeyDict.MARKET_SPLIT,
      route: '#',
      editable: true,
      indicatorType: IndicationsKeyDict.MARKET_SPLIT,
      isSaved: isSavedIndication(IndicationsKeyDict.MARKET_SPLIT),
      onEdit: (): void => {
        setMarketSplitTab((prev: any) => !prev);
      }
    },
    {
      title: IndicationsKeyDict.FOCUSED_MOLECULE,
      route: '#',
      editable: true,
      indicatorType: IndicationsKeyDict.FOCUSED_MOLECULE,
      isSaved: isSavedIndication(IndicationsKeyDict.FOCUSED_MOLECULE),
      onEdit: (): void => {
        setFocusedMoleculeTab((prev: any) => !prev);
      }
    },
    {
      title: IndicationsKeyDict.DOSING_CALCULATIONS,
      route: '#',
      editable: true,
      indicatorType: IndicationsKeyDict.DOSING_CALCULATIONS,
      isSaved: isSavedIndication(IndicationsKeyDict.DOSING_CALCULATIONS),
      onEdit: (): void => {
        setDosingTab((prev: any) => !prev);
      }
    }
  ];

  const initStore = (): void => {
    dispatch(patientFlowActions.setStartYear({ value: years[0] }));
    dispatch(patientFlowActions.setEndYear({ value: years[years.length - 1] }));
    years.forEach(year => {
      dispatch(patientFlowActions.addNewForm(initIndicatorsGroup(year)));
      dispatch(patientFlowActions.addNewTotalKgOfOriginatorProductConsumedItem({ year, value: 0 }));
    });
  };

  const getMultiTraditonalId = async (): Promise<[]> => {
    let multiTradIdList = await getMultipleForecastId(activeForecastItems1.program_configuration_id, 'Patient');
    let GeoValue = '';
    if (multiTradIdList[0]?.data && multiTradIdList[0]?.data) {
      multiTradIdList[0]?.data?.TraditionalforecastList?.forEach((trad_id: any) => {
        let trad_obj: any = {};
        Object.defineProperties(trad_obj, {
          name: {
            value: 'Trad_id',
            writable: true
          },
          id: {
            value: trad_id.tradionalForecastId,
            writable: true
          },
          title: {
            value: trad_id.region,
            writable: true
          },
          value: {
            value: trad_id.tradionalForecastId,
            writable: true
          }
        });
        let index = Traditional_id_arr.findIndex((item: any) => item?.id == trad_obj?.id);
        if (index < 0) {
          Traditional_id_arr.push(trad_obj);
        }

        if (trad_id.tradionalForecastId == activeForecastItems1.traditional_forecast_id) {
          GeoValue = trad_id.region;
          setGeoName(trad_id.tradionalForecastId);
        }
      });

      setMultiGeoName(GeoValue);
      settradIdArr(Traditional_id_arr);
    }

    return [];
  };
  
  const getEstimatedTreatment = async (): Promise<[]> => {
    let estimateTraetedArray;
    estimateTraetedArray = epidemiologyId
      ? await getEstimatedTreatmentData(activeForecastItems1.traditional_forecast_id)
      : [];
    console.log('estimateTraetedArray', estimateTraetedArray);
    setNewDataCal(estimateTraetedArray);
    const estimatedTreatedDataList: MainTableRowItem[] = [];
    estimateTraetedArray[0]?.data.map((estTreatData: Prevalence) => {
      const newEstimateRow = prevalenceRow(
        estTreatData,
        IndicationsKeyDict.PREVALENCE,
        true,
        prevalenceTableData.length
      );
      estimatedTreatedDataList.push(newEstimateRow);
    });
    setEstimatedTreatedPatientTableData(estimatedTreatedDataList);
    return estimateTraetedArray[0]?.data;
  };

  const { data: originatorData } = useQuery(
    ['originatorSection'],
    () =>
      getOriginatorEvent({
        traditionalForecastId: activeForecastItems1.traditional_forecast_id as number
      }),
    {
      onSuccess: data => {},
      onError: (error: AxiosError) => {}
    }
  );

  const { totalOfOriginatorProductConsumed } = useSelector<Store, DosingCalculationsInterface>(
    selectDosingCalculations
  );

  const handleSaveEvent = (): void => {
    savePatientEpidemiologyData(activeForecastItems1.traditional_forecast_id as number)
      .then(() => {
        const totalOfOriginatorProductConsumedRounded = totalOfOriginatorProductConsumed.map(item => {
          return {
            value: Number(item.value).toFixed(2) as any,
            year: item.year
          };
        });

        if (!originatorData?.data.id) {
          const formData: OriginatorModel = {
            projectionType: originatorData?.data.projectionType || MarketProjectionType.MANUAL,
            traditionalForecastId: activeForecastItems1.traditional_forecast_id as number,
            originatorMarketSizes: [],
            marketProjections: [],
            finalOriginatorIndicators: totalOfOriginatorProductConsumedRounded ?? []
          };
          addOriginatorEvent(formData)
            .then(() => {})
            .catch();
        } else {
          const formData: OriginatorModel = {
            projectionType: originatorData?.data.projectionType || MarketProjectionType.MANUAL,
            traditionalForecastId: activeForecastItems1.traditional_forecast_id as number,
            originatorMarketSizes: [],
            marketProjections: [],
            finalOriginatorIndicators: totalOfOriginatorProductConsumedRounded ?? []
          };
          updateOriginatorEvent(originatorData.data.id, formData)
            .then(() => {})
            .catch();
        }

        navigate(`../${RoutesPaths.VOLUME_FLOW}`);
      })
      .catch(err => {
        console.log({ err });
      });
  };

  const handleTradIdChange = async (event: any): Promise<void> => {
    let geoName: any = '';

    let multiTradIdList = await getMultipleForecastId(activeForecastItems1.program_configuration_id);
    if (multiTradIdList[0]?.data) {
      multiTradIdList[0]?.data?.TraditionalforecastList?.forEach((trad_id: any) => {
        if (trad_id.tradionalForecastId == event.target.value) {
          geoName = trad_id.region;
        }
      });
      setMultiGeoName(geoName);
    }

    populateEpidemSavedData(event.target.value);
  };

  const populateEpidemSavedData = async (tradId: any) => {
    getNewEpidemSavedData(tradId as number)
      .then((data: any) => {
        if (data[0]?.data != null) {
          const {
            prevalence,
            patientdiganosedindications,
            patientdrugreated,
            originator_market_share,
            dosingcalculation
          } = data[0]?.data;
          if (prevalence[0]) {
            prevalence[0].map((item: any) => {
              prevalence.map((item: any, prevIndex: number) => {
                dispatch(patientFlowActions.addNewPrevalence(item));
                prevArr.push(prevalenceRow(item, IndicationsKeyDict.PREVALENCE, false, prevIndex));
              });
              setPrevalenceTableData(prevArr);
            });
          }
          if (dosingcalculation[0]) {
            dispatch(patientFlowActions.updateDosingCalculations(dosingcalculation[0]));
          }
          if (patientdiganosedindications[0]) {
            console.log(patientdiganosedindications[0], data[0]?.data, 'dataa check');
            const sortedPatientdiagnosedIndications = sortBy(patientdiganosedindications[0], [
              function (o) {
                return o.year;
              }
            ]);
            const groupedData = sortedPatientdiagnosedIndications.reduce((acc, obj) => {
              const key = obj.type;
              if (!acc[key]) {
                acc[key] = [];
              }
              acc[key].push(obj);
              return acc;
            }, {});
            interface DataItem {
              key: string;
              value: string | any;
            }
            const dataEntries: DataItem[] = Object.entries(groupedData).map(([key, value]) => ({
              key,
              value
            }));
            dataEntries.forEach(({ key, value }, index) => {
              if (index === 0) {
                dispatch(
                  patientFlowActions.setDiseaseValue({
                    id: `diseaseIndicator-${index + 1}`,
                    value: key
                  })
                );
              } else {
                dispatch(patientFlowActions.addNewIndication({}));
                dispatch(
                  patientFlowActions.addNewDisease({
                    name: `Diagnosed Disease Indication-${index + 1}`,
                    id: `diseaseIndicator-${index + 1}`,
                    value: key
                  })
                );
              }
              if (value.length) {
                value.map((item: { year: any; type: any; value: any }, idx: number) => {
                  dispatch(
                    patientFlowActions.setIndicationValue({
                      year: item.year,
                      type: 'Prevalance Diagnosed Disease Indicator',
                      name: `Prevalance Diagnosed Disease Indicator-${index + 1}`,
                      value: item.value
                    })
                  );
                });
              }
            });
          }

          if (patientdrugreated[0]) {
            const sortedPatientdiagnosedIndications = sortBy(patientdrugreated[0], [
              function (o) {
                return o.year;
              }
            ]);
            const groupedData = sortedPatientdiagnosedIndications.reduce((acc, obj) => {
              const key = obj.type;
              if (!acc[key]) {
                acc[key] = [];
              }
              acc[key].push(obj);
              return acc;
            }, {});
            interface DataItem {
              key: string;
              value: string | any;
            }
            const dataEntries: DataItem[] = Object.entries(groupedData).map(([key, value]) => ({
              key,
              value
            }));
            dataEntries.forEach(({ key, value }, index) => {
              if (value.length) {
                value.map((item: { year: any; type: any; value: any }, idx: number) => {
                  dispatch(
                    patientFlowActions.setIndicationValue({
                      name: `Drug Treated Indicator-${index + 1}`,
                      type: 'Drug Treated Indicator',
                      value: item.value,
                      year: item.year
                    })
                  );
                });
              }
            });
          }

          if (originator_market_share[0]) {
            const sortedoriginatorMarketShare = sortBy(originator_market_share[0], [
              function (o) {
                return o.year;
              }
            ]);
            const groupedData = sortedoriginatorMarketShare.reduce((acc, obj) => {
              const key = obj.type;
              if (!acc[key]) {
                acc[key] = [];
              }
              acc[key].push(obj);
              return acc;
            }, {});
            interface DataItem {
              key: string;
              value: string | any;
            }
            const dataEntries: DataItem[] = Object.entries(groupedData).map(([key, value]) => ({
              key,
              value
            }));
            dataEntries.forEach(({ key, value }, index) => {
              if (value.length) {
                value.map((item: { year: any; type: any; value: any }, idx: number) => {
                  dispatch(
                    patientFlowActions.setIndicationValue({
                      name: `Originator Market Share Indication-${index + 1}`,
                      type: 'Originator Market Share Indication',
                      value: item.value,
                      year: item.year
                    })
                  );
                });
              }
            });
          }
        }
      })
      .catch(() => {});

    window.location.reload();
  };

  useEffect(() => {
    getMultiTraditonalId();
  }, []);

  useEffect(() => {
    getNewEpidemSavedData(activeForecastItems1.traditional_forecast_id as number)
      .then((data: any) => {
        console.log(data, '=================+++++');

        if (data[0]?.data != null) {
          dispatch(patientFlowActions.setEpidemiologyId({ value: data[0]?.data?.epidemiology_id || 0 }));
          setEpidemiologyId(data[0]?.data?.epidemiology_id || 0);
          const {
            prevalence,
            diagnose_treated_placeholder,
            patientdiganosedindications,
            patientdrugreated,
            originator_market_share,
            dosingcalculation,
            market_split_percent,
            estimated_treated_patients,
            target_population,
            target_population_percent
          } = data[0]?.data;
          let estimatedTreatedData: MainTableRowItem[] = [];
          let targetPopulationItem: MainTableRowItem[] = [];
          let targetPopulationPercentageItem: MainTableRowItem[] = [];

          if (market_split_percent.length == 0) {
            addMarketSplitRow();
          }
          if (prevalence.length == 0) {
            addPrevalenceRow();
          }
          if (prevalence[0]) {
            prevalence.map((item: any, prevIndex: number) => {
              let diagnoseNewArr = {
                id: Math.floor(Math.random() * 10) + 1,
                label: 'Prevalence A',
                indicators: getYearValueData()
              };
              dispatch(patientFlowActions.setPrevalenceList(item));
              prevArr.push(prevalenceRow(item, IndicationsKeyDict.PREVALENCE, false, prevIndex));
              if (estimated_treated_patients.length == 0) {
                estimatedTreatedData.push(
                  prevalenceRow(diagnoseNewArr, IndicationsKeyDict.ESTIMATED_TREATED_PATIENTS, false, prevIndex)
                );
              }
              if (target_population.length == 0) {
                targetPopulationItem.push(
                  prevalenceRow(diagnoseNewArr, IndicationsKeyDict.TARGET_POPULATION, false, prevIndex)
                );
                let TargetPopulationResultRow = {
                  id: Math.floor(Math.random() * 10) + 1,
                  label: 'Total',
                  indicators: getYearValueData()
                };
                targetPopulationPercentageItem.push(
                  prevalenceRow(diagnoseNewArr, IndicationsKeyDict.TARGET_POPULATION, false, prevIndex)
                );
                targetPopulationPercentageItem.push(
                  prevalenceRow(
                    TargetPopulationResultRow,
                    IndicationsKeyDict.ESTIMATED_TREATED_PATIENTS,
                    false,
                    prevIndex
                  )
                );
              }
            });
            setEstimatedTreatedPatientTableData(estimatedTreatedData);
            setPrevalenceTableData(prevArr);
            setTargetPopulationTableData(targetPopulationItem);
            setTargetPopulationPercentageTableData(targetPopulationPercentageItem);
            
            if (!diagnose_treated_placeholder[0]) {
              for (let index = 0; index < 5; index++) {
                let labeDataTable: MainTableRowItem[] = [];
                let diagnoseLabeData: Prevalence[] = [];
                prevalence.map((item: any, prevIndex: number) => {
                  let diagnoseNewArr = {
                    id: Math.floor(Math.random() * 10) + 1,
                    label: 'Prevalence A',
                    indicators: getYearValueData()
                  };
                  diagnoseLabeData.push(diagnoseNewArr);
                  labeDataTable.push(
                    prevalenceRow(
                      diagnoseNewArr,
                      IndicationsKeyDict.DIAGNOSED_AND_TREATED_POPULATION,
                      false,
                      prevIndex,
                      index
                    )
                  );
                });
                diagnoseArr.push({ placeholder_type: index + 1, labelData: labeDataTable });
                dispatch(
                  patientFlowActions.setDiagnosisTreatmentList({
                    placeholder_type: index + 1,
                    labelData: diagnoseLabeData
                  } as DiagnoseDataList)
                );
              }
              setDiagnosePlaceholderList(diagnoseArr);
            }
          }

          if (diagnose_treated_placeholder[0]) {
            diagnose_treated_placeholder.map((item: any, Index: number) => {
              const labelDataItem: MainTableRowItem[] = [];
              const labelDataMap: Prevalence[] = [];
              item.label_data.map((label: Prevalence, labelIndex: number) => {
                if (labelIndex < prevalence.length) {
                  labelDataMap.push(label);
                  labelDataItem.push(
                    prevalenceRow(label, IndicationsKeyDict.DIAGNOSED_AND_TREATED_POPULATION, false, labelIndex, Index)
                  );
                }
              });
              dispatch(
                patientFlowActions.setDiagnosisTreatmentList({
                  placeholder_type: item.placeholder_type,
                  labelData: labelDataMap
                })
              );
              diagnoseArr.push({ placeholder_type: item.placeholder_type, labelData: labelDataItem });
            });
            setDiagnosePlaceholderList(diagnoseArr);
          }
          if (estimated_treated_patients[0]) {
            const estimatedTreatedDataList: MainTableRowItem[] = [];
            estimated_treated_patients.map((estTreatData: Prevalence) => {
              const newEstimateRow = prevalenceRow(
                estTreatData,
                IndicationsKeyDict.PREVALENCE,
                true,
                prevalenceTableData.length
              );
              estimatedTreatedDataList.push(newEstimateRow);
            });
            setEstimatedTreatedPatientTableData(estimatedTreatedDataList);
          }
          if (target_population[0]) {
            console.log(target_population, target_population_percent, targetPopulationPercentageItem);
          }

          if (dosingcalculation[0]) {
            dispatch(patientFlowActions.updateDosingCalculations(dosingcalculation[0]));
          }
          if (patientdiganosedindications[0]) {
            const sortedPatientdiagnosedIndications = sortBy(patientdiganosedindications[0], [
              function (o) {
                return o.year;
              }
            ]);
            const groupedData = sortedPatientdiagnosedIndications.reduce((acc, obj) => {
              const key = obj.type;
              if (!acc[key]) {
                acc[key] = [];
              }
              acc[key].push(obj);
              return acc;
            }, {});
            interface DataItem {
              key: string;
              value: string | any;
            }
            const dataEntries: DataItem[] = Object.entries(groupedData).map(([key, value]) => ({
              key,
              value
            }));
            dataEntries.forEach(({ key, value }, index) => {
              if (index === 0) {
                dispatch(
                  patientFlowActions.setDiseaseValue({
                    id: `diseaseIndicator-${index + 1}`,
                    value: key
                  })
                );
              } else {
                dispatch(patientFlowActions.addNewIndication({}));
                dispatch(
                  patientFlowActions.addNewDisease({
                    name: `Diagnosed Disease Indication-${index + 1}`,
                    id: `diseaseIndicator-${index + 1}`,
                    value: key
                  })
                );
              }
              if (value.length) {
                value.map((item: { year: any; type: any; value: any }, idx: number) => {
                  dispatch(
                    patientFlowActions.setIndicationValue({
                      year: item.year,
                      type: 'Prevalance Diagnosed Disease Indicator',
                      name: `Prevalance Diagnosed Disease Indicator-${index + 1}`,
                      value: item.value
                    })
                  );
                });
              }
            });
          }

          if (patientdrugreated[0]) {
            const sortedPatientdiagnosedIndications = sortBy(patientdrugreated[0], [
              function (o) {
                return o.year;
              }
            ]);
            const groupedData = sortedPatientdiagnosedIndications.reduce((acc, obj) => {
              const key = obj.type;
              if (!acc[key]) {
                acc[key] = [];
              }
              acc[key].push(obj);
              return acc;
            }, {});
            interface DataItem {
              key: string;
              value: string | any;
            }
            const dataEntries: DataItem[] = Object.entries(groupedData).map(([key, value]) => ({
              key,
              value
            }));
            dataEntries.forEach(({ key, value }, index) => {
              if (value.length) {
                value.map((item: { year: any; type: any; value: any }, idx: number) => {
                  dispatch(
                    patientFlowActions.setIndicationValue({
                      name: `Drug Treated Indicator-${index + 1}`,
                      type: 'Drug Treated Indicator',
                      value: item.value,
                      year: item.year
                    })
                  );
                });
              }
            });
          }

          if (originator_market_share[0]) {
            const sortedoriginatorMarketShare = sortBy(originator_market_share[0], [
              function (o) {
                return o.year;
              }
            ]);
            const groupedData = sortedoriginatorMarketShare.reduce((acc, obj) => {
              const key = obj.type;
              if (!acc[key]) {
                acc[key] = [];
              }
              acc[key].push(obj);
              return acc;
            }, {});
            interface DataItem {
              key: string;
              value: string | any;
            }
            const dataEntries: DataItem[] = Object.entries(groupedData).map(([key, value]) => ({
              key,
              value
            }));
            dataEntries.forEach(({ key, value }, index) => {
              if (value.length) {
                value.map((item: { year: any; type: any; value: any }, idx: number) => {
                  dispatch(
                    patientFlowActions.setIndicationValue({
                      name: `Originator Market Share Indication-${index + 1}`,
                      type: 'Originator Market Share Indication',
                      value: item.value,
                      year: item.year
                    })
                  );
                });
              }
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    initStore();
  }, []);

  // 🆕 Update focused molecule table when selections or market data changes
  useEffect(() => {
    if (focusedMoleculeSelections.length > 0 && marketPatientsTableData.length > 0) {
      generateFocusedMoleculeTable();
    }
  }, [focusedMoleculeSelections, marketPatientsTableData, marketSplitPercentageTableData]);

  const addRowButtonStyles = {
    backgroundColor: '#2C3E50',
    color: '#fff',
    borderRadius: '6px',
    fontSize: '16px',
    padding: '6px 10px'
  };

  return (
    <Box display="flex" flexDirection="column" width="100%" borderRight="1px solid #ddd" padding="16px" gap="12px">
      <Box display="flex" flexDirection="row" width="100%" justifyContent="space-between">
        <FormDropDown
          labelName="Geo-Name"
          options={tradIdArr}
          control={control}
          name="multi_geo_name"
          sx={{ width: '190px', height: '40px' }}
          onChangeEvent={e => {
            handleTradIdChange(e);
          }}
          value={geoName}
        />
        <Button
          variant="contained"
          sx={{
            width: '50%',
            ...addRowButtonStyles
          }}
          onClick={() => {
            navigate(`../${RoutesPaths.TRADITIONAL_FORECAST}/${RoutesPaths.PROGRAM_CONFIGURATION}`);
          }}
        >
          Model Configuration
        </Button>
      </Box>
      <Box width="100%" bgcolor="#ADBDCC" padding="16px" marginBottom="20px" borderRadius="6px">
        <Typography variant="h4" align="center" color="#003366">
          Epidemiology Model
        </Typography>
      </Box>

      {epidemiologyInputs.map((item, index) => (
        <Box key={item.title} width="100%">
          <Button
            key={item.title}
            variant="outlined"
            sx={{
              width: '100%',
              justifyContent: 'center',
              textTransform: 'none',
              fontSize: '14px',
              borderRadius: '6px',
              padding: '8px 14px',
              backgroundColor: '#fff',
              borderColor: '#000000',
              color: '#2C3E50',
              '&:hover': {
                backgroundColor: '#2C3E50',
                borderColor: '#2C3E50',
                color: '#fff'
              }
            }}
            onClick={item?.onEdit || (() => {})}
            onDoubleClick={() => {
              if (item.title === IndicationsKeyDict.PREVALENCE) setPrevalenceTab(false);
              if (item.title === IndicationsKeyDict.DIAGNOSED_AND_TREATED_POPULATION) setDiagnoseTab(false);
              if (item.title === IndicationsKeyDict.ESTIMATED_TREATED_PATIENTS) {
                setEstimateTreatedTab(false);
              }
              if (item.title === IndicationsKeyDict.TARGET_POPULATION) setTargetPopulationTab(false);
              if (item.title === IndicationsKeyDict.MARKET_SPLIT) setMarketSplitTab(false);
              if (item.title === IndicationsKeyDict.FOCUSED_MOLECULE) setFocusedMoleculeTab(false);
            }}
          >
            {item.title}
          </Button>

          {/* Prevalence Section */}
          {item.title === IndicationsKeyDict.PREVALENCE && (
            <Collapse in={prevalenceTab} timeout="auto" unmountOnExit>
              <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: '8px', mb: 3, background: '#f9f9f9' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Prevalence</Typography>
                  <Box display="flex" gap={1}>
                    <Button onClick={addPrevalenceRow} sx={addRowButtonStyle} variant="contained" size="small">
                      Add Row
                    </Button>
                    <Button onClick={removePrevalenceRow} sx={addRowButtonStyle} variant="outlined" size="small">
                      Remove Row
                    </Button>
                  </Box>
                </Box>
                <TableComponent
                  enableZeroColumn={false}
                  mainTableHeaderItems={['Label', ...years.map(String)]}
                  mainTableRowItems={prevalenceTableData}
                  outerBoxStyles={{ mt: 1 }}
                />
              </Box>
              <Box display="flex" justifyContent="end">
                <Button onClick={savePrevalence} variant="contained" size="small">
                  Save
                </Button>
              </Box>
            </Collapse>
          )}

          {/* Diagnosed and Treated Population Section */}
          {item.title === IndicationsKeyDict.DIAGNOSED_AND_TREATED_POPULATION && (
            <Collapse in={diagnoseTab} timeout="auto" unmountOnExit>
              <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: '8px', background: '#f9f9f9' }}>
                <Typography variant="h6" mb={2}>
                  Diagnosed and Treated Population (%)
                </Typography>

                {diagnosePlaceholderList.map((placeholder: DiagnosePlaceholder, pIdx: number) => (
                  <Box key={pIdx} sx={{ mb: 3, border: '1px solid #ddd', borderRadius: '6px' }}>
                    <Typography variant="subtitle1" sx={{ p: 1, background: '#eee' }}>
                      Placeholder{' '}
                      {diagnosePlaceholderList[0].placeholder_type
                        ? placeholder.placeholder_type
                        : placeholder.placeholder_type + 1}
                    </Typography>

                    <TableComponent
                      enableZeroColumn={false}
                      mainTableHeaderItems={['Label', ...years.map(String)]}
                      mainTableRowItems={placeholder.labelData}
                      outerBoxStyles={{ mt: 1 }}
                    />
                  </Box>
                ))}
              </Box>
              <Box display="flex" justifyContent="end">
                <Button onClick={saveDiagnosisTreatment} variant="contained" size="small">
                  Save
                </Button>
              </Box>
            </Collapse>
          )}

          {/* Estimated Treated Patients Section */}
          {item.title === IndicationsKeyDict.ESTIMATED_TREATED_PATIENTS && (
            <Collapse in={estimateTreatedTab} timeout="auto" unmountOnExit>
              <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: '8px', mb: 3, background: '#f9f9f9' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Estimated Treated Patients</Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <Button onClick={getEstimatedTreatment} variant="contained" size="small">
                    Refresh
                  </Button>
                </Box>

                <TableComponent
                  enableZeroColumn={false}
                  mainTableHeaderItems={['Label', ...years.map(String)]}
                  mainTableRowItems={estimatedTreatedPatientTableData}
                  outerBoxStyles={{ mt: 1 }}
                />
              </Box>
            </Collapse>
          )}

          {/* Target Population Section */}
          {item.title === IndicationsKeyDict.TARGET_POPULATION && (
            <Collapse in={targetPopulationTab} timeout="auto" unmountOnExit>
              <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: '8px', mb: 3, background: '#f9f9f9' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{IndicationsKeyDict.TARGET_POPULATION}%</Typography>
                </Box>
                <TableComponent
                  enableZeroColumn={false}
                  mainTableHeaderItems={['Label', ...years.map(String)]}
                  mainTableRowItems={targetPopulationTableData}
                  outerBoxStyles={{ mt: 1 }}
                />
              </Box>
              <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: '8px', mb: 3, background: '#f9f9f9' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{IndicationsKeyDict.TARGET_POPULATION}</Typography>
                </Box>
                <TableComponent
                  enableZeroColumn={false}
                  mainTableHeaderItems={['Label', ...years.map(String)]}
                  mainTableRowItems={targetPopulationPercentageTableData}
                  outerBoxStyles={{ mt: 1 }}
                />
              </Box>
            </Collapse>
          )}

          {/* Market Split Section */}
          {item.title === IndicationsKeyDict.MARKET_SPLIT && (
            <Collapse in={marketSplitTab} timeout="auto" unmountOnExit>
              <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: '8px', mb: 3, background: '#f9f9f9' }}>
                <Box display="flex" justifyContent="space-between" flexDirection="column" alignItems="start" mb={2}>
                  <Typography variant="h6">Market Split %</Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Button onClick={addMarketSplitRow} sx={addRowButtonStyle} variant="contained" size="small">
                      Add Row
                    </Button>
                    <Button onClick={removeMarketSplitRow} sx={addRowButtonStyle} variant="outlined" size="small">
                      Remove Row
                    </Button>
                  </Box>
                </Box>

                <TableComponent
                  enableZeroColumn={false}
                  mainTableHeaderItems={['Label', ...years.map(String)]}
                  mainTableRowItems={marketSplitPercentageTableData}
                  outerBoxStyles={{ mt: 1 }}
                />
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mt={3}>
                  <Typography variant="h6">Market Patients</Typography>
                </Box>
                <TableComponent
                  enableZeroColumn={false}
                  mainTableHeaderItems={['Label', ...years.map(String)]}
                  mainTableRowItems={marketPatientsTableData}
                  outerBoxStyles={{ mt: 1 }}
                />
              </Box>
              <Box display="flex" justifyContent="end">
                <Button onClick={savePrevalence} variant="contained" size="small">
                  Save
                </Button>
              </Box>
            </Collapse>
          )}

          {/* 🆕 Focused Molecule Section with Dropdown */}
          {item.title === IndicationsKeyDict.FOCUSED_MOLECULE && (
            <Collapse in={focusedMoleculeTab} timeout="auto" unmountOnExit>
              <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: '8px', mb: 3, background: '#f9f9f9' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{IndicationsKeyDict.FOCUSED_MOLECULE}</Typography>
                </Box>
                <Box display="flex" gap={1} mb={2}>
                  <Button onClick={generateFocusedMoleculeTable} variant="contained" size="small">
                    Refresh
                  </Button>
                </Box>

                <TableComponent
                  enableZeroColumn={false}
                  mainTableHeaderItems={['Label (Select from Market Split)', ...years.map(String)]}
                  mainTableRowItems={focusedMoleculeTableData}
                  outerBoxStyles={{ mt: 1 }}
                />
              </Box>
            </Collapse>
          )}

          {/* Dosing Calculations Section */}
          {item.title === IndicationsKeyDict.DOSING_CALCULATIONS && (
            <Collapse in={dosingTab} timeout="auto" unmountOnExit>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" mb={2}>
                  Dosing Calculations
                </Typography>

                <DosingCalculations />

                <Box mt={3} p={2} borderRadius="8px">
                  <Typography fontSize="15px" fontWeight={600} mb={2}>
                    TOTAL KG of Originator Product Consumed
                  </Typography>
                  <TableComponent
                    enableZeroColumn={false}
                    mainTableHeaderItems={['Label', ...years.map(String)]}
                    mainTableRowItems={[
                      {
                        key: 'total-kg-row',
                        cellItems: [
                          {
                            key: 'label',
                            content: (
                              <Typography sx={{ fontWeight: 500, textAlign: 'center', width: '150px' }}>
                                TOTAL KG of Originator Product Consumed
                              </Typography>
                            )
                          },
                          ...years.map(year => {
                            return {
                              key: `year-${year}`,
                              content: (
                                <Box display="flex" alignItems="center" justifyContent="center">
                                  <TotalKgOriginatorProductConsumedIndicator
                                    year={year}
                                    NewDataCal={NewDataCal}
                                  />
                                </Box>
                              )
                            };
                          })
                        ]
                      }
                    ]}
                  />
                </Box>
              </Box>

              <Box display="flex" justifyContent="end" mt={2}>
                <Button onClick={handleSaveEvent} variant="contained" size="small">
                  Save
                </Button>
              </Box>
            </Collapse>
          )}
        </Box>
      ))}

      <Box display="flex" justifyContent="flex-end" width="100%" marginTop="20px">
        <Button variant="contained" sx={addRowButtonStyles} onClick={handleSaveEvent}>
          Save & Next
        </Button>
      </Box>
    </Box>
  );
};
