export const BREACH_CONFIG_REPORT = `
select description "Breach Name", duration / 60000 "Number of Minutes", 
case when id = "HOT_BREACH" or id = "COLD_BREACH" then "Continuous" else "Cumulative" end as "Breach Type",
case when id = "HOT_BREACH" or id ="HOT_CUMULATIVE" then minimumTemperature else maximumTemperature end as Temperature,
case when id = "HOT_BREACH" or id ="HOT_CUMULATIVE" then "Max" else "Min" end as Direction
from temperaturebreachconfiguration
`;

export const BREACH_REPORT = `
select (select "Continuous") "Breach Type",
tbc.description "Breach Name",
datetime(startTimestamp, "unixepoch", "localtime") "Start date",
coalesce(datetime(endTimestamp, "unixepoch", "localtime"), datetime("now", "localtime")) as "End date",
(coalesce(endTimestamp, strftime("%s", "now")) - startTimestamp) / 60 "Exposure Duration (minutes)",
max(temperature) as "Max Temp",
min(temperature) as "Min Temp"
from temperaturebreach tb
join temperaturelog tl on tl.temperatureBreachId = tb.id
left join temperaturebreachconfiguration tbc on temperatureBreachConfigurationId = tb.temperatureBreachConfigurationId
where tb.sensorId = ?
group by tb.id
`;

export const REPORT = `
select datetime(s.programmedDate, "unixepoch", "localtime") "Programmed On", datetime(max(min(tl.timestamp),s.logDelay),"unixepoch","localtime") "Logging Start", s.logInterval / 60 "Logging Interval"
from sensor s
left join temperaturelog tl on tl.sensorId = s.id
where s.id = ?
`;

export const LOGS_REPORT = `
with cumulativeBreachFields as (
    select *, (select case when sum(logInterval) * 1000 >= (select duration from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE')  then 1 else 0 end as hasHotCumulative from temperaturelog where temperature >= hotCumulativeMinThreshold and temperature <= hotCumulativeMaxThreshold and sensorId = ?) as hasHotCumulative,
  (select case when sum(logInterval) *1000 >= (select duration from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') then 1 else 0 end as hasColdCumulative from temperaturelog where temperature >= coldCumulativeMinThreshold and temperature <= coldCumulativeMaxThreshold and sensorId = ?) as hasColdCumulative
  from ( 
       select (select maximumTemperature from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeMaxThreshold,
      (select minimumTemperature from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeMinThreshold,
      (select duration from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeDuration,
      (select maximumTemperature from temperaturebreachconfiguration where id = 'COLD_CUMULATIVE') as coldCumulativeMaxThreshold,
      (select minimumTemperature from temperaturebreachconfiguration where id = 'COLD_CUMULATIVE') as coldCumulativeMinThreshold,
      (select duration from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as coldCumulativeDuration
  )
  )
  
  select case 
  when (select hasHotCumulative from cumulativeBreachFields) = 1 and temperature >= (select hotCumulativeMinThreshold from cumulativeBreachFields) and temperature <= (select hotCumulativeMaxThreshold from cumulativeBreachFields) then "Hot" 
  when (select hasColdCumulative from cumulativeBreachFields) = 1 and temperature >= (select coldCumulativeMinThreshold from cumulativeBreachFields) and temperature <= (select coldCumulativeMaxThreshold from cumulativeBreachFields) then "Cold"
  else "x" end as "Is cumulative breach",
  datetime(timestamp,"unixepoch","localtime") Timestamp,
  temperature Temperature,
  tl.logInterval / 60 "Logging Interval (Minutes)",
  case when tbc.id = "HOT_BREACH" then "Hot" when tbc.id = "COLD_BREACH" then "Cold" else "" end as "Is continuous breach"
  from temperaturelog tl
  left join temperatureBreach tb on tb.id = tl.temperatureBreachId
  left join temperaturebreachconfiguration tbc on tbc.id = tb.temperatureBreachConfigurationId
  
where tl.sensorId = ?
`;

export const STATS = `
with cumulativeBreachFields as (
  select *, (select case when sum(logInterval) >= hotCumulativeDuration then 1 else 0 end as hasHotCumulative from temperaturelog where temperature >= hotCumulativeMinThreshold and temperature <= hotCumulativeMaxThreshold and sensorId = ?) as hasHotCumulative,
  (select case when sum(logInterval) >= coldCumulativeDuration then 1 else 0 end as hasColdCumulative from temperaturelog where temperature >= coldCumulativeMinThreshold and temperature <= coldCumulativeMaxThreshold and sensorId = ?) as hasColdCumulative
  from ( 
       select (select maximumTemperature from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeMaxThreshold,
      (select minimumTemperature from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeMinThreshold,
      (select duration from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeDuration,
      (select maximumTemperature from temperaturebreachconfiguration where id = 'COLD_CUMULATIVE') as coldCumulativeMaxThreshold,
      (select minimumTemperature from temperaturebreachconfiguration where id = 'COLD_CUMULATIVE') as coldCumulativeMinThreshold,
      (select duration from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as coldCumulativeDuration
  )
  )

select max(temperature) "Max Temperature", min(temperature) "Min Temperature",
cbf.hasHotCumulative + cbf.hasColdCumulative as "Number of cumulative breaches",
(select count(*) from temperaturebreach where sensorid = ?) as "Number of continuous breaches"
from temperaturelog
left join cumulativeBreachFields cbf
where sensorid = ?
group by sensorid`;