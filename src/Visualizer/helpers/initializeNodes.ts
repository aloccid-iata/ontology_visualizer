import { fullTableName } from "./fullTableName";
import { DatabaseConfig, EdgeConfig, Position, TableConfig, TablePositions, TableColumnConfig } from "../types";



const setHandleType = (tableConfigs: TableConfig[], tableName: string, columnName: string, handleType: string) => {
  tableConfigs.forEach(tableConfig => {
    const configTableName = fullTableName(tableConfig.name, tableConfig.schema || "public");

    if(configTableName === tableName) {
      tableConfig.columns.forEach((columnConfig: any) => {
        if(columnConfig.name === columnName) {
          columnConfig.handleType = handleType;
        }
      });
    }
  });
};

export const initializeNodes = (databaseConfig: DatabaseConfig) => {
  const tables = [] as any;
  const tablePositionsWithSchema = {} as TablePositions;

  Object.entries(databaseConfig.tablePositions).forEach(params => {
    const tableName = params[0];
    const position = params[1] as Position;

    if(tableName.includes(".")) {
      tablePositionsWithSchema[tableName as keyof TablePositions] = position;
    } else {
      tablePositionsWithSchema[fullTableName(tableName) as keyof TablePositions] = position;
    }
  });

  databaseConfig.edgeConfigs.forEach((edgeConfig: EdgeConfig) => {
    const sourceTableName = fullTableName(edgeConfig.source);
    setHandleType(databaseConfig.tables, sourceTableName, edgeConfig.sourceKey, "source");

    const targetTableName = fullTableName(edgeConfig.target);
    setHandleType(databaseConfig.tables, targetTableName, edgeConfig.targetKey, "target");
  });

  databaseConfig.tables.forEach((tableConfig: TableConfig) => {
    const schemaName = tableConfig.schema || "public";
    const tableID = fullTableName(tableConfig.name, schemaName);

    const tableDefinition = {
      id: tableID,
      data: tableConfig,
      position: (tablePositionsWithSchema as any)[tableID] || { x: 0, y: 0 },
      type: "table"
    }

    tables.push(tableDefinition);
  });

  return tables;
};

export const initializeSearch = (databaseConfig: DatabaseConfig) => {
  let searchEntries: Array<({value:string, label:string})> = [];


  Object.entries(databaseConfig.tablePositions).forEach(params => {

    const entry = {
      value: params[0] , 
      label: (params[0].includes('.')? params[0].split('.')[1]: params[0])
    }

    searchEntries.push(entry)
  });


  databaseConfig.tables.forEach((tableConfig: TableConfig) => {
    tableConfig.columns.forEach((columnConfig: TableColumnConfig) => {
      const entry = {
        value: tableConfig.schema + '.' + tableConfig.name , 
        label: tableConfig.name + '.' + columnConfig.name
      }
      searchEntries.push(entry);
    });    
  });

  return searchEntries;
};