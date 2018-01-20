SELECT 
    rowkey, 
    general.created_at.cell.value AS created_at, 
    general.url.cell.value AS url,
    general.url.cell.value as type
FROM FLATTEN([gridy-bigtable:github.owners], FLATTEN(general.url.cell.value, general.type.cell.value))
LIMIT 1000