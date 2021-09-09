# Changelog

## 3.2.0

- Added tabulators to logs for better readability

## 3.1.0

- Added info about ongoing charging.
- Last logs have been reversed.
- Fixed case when charging has stopped and lid was suddenly opened

## 3.0.0

This change is not backward compatible. You should delete the log file `tob-data.csv` before starting the service.

- The service collects battery percentage
- "Time elapsed from last charging" shows battery percentage
- "Last periods on battery" show battery percentage from and to

## 2.0.1 - 2.0.7

Minor improvement and fixes for calculate battery periods algorithm

## 2.0.0

This change is not backward compatible. You should delete the log file `tob-data.csv` before starting the service.

- Rewriting algorithms to simplify and improve logic

## 1.0.0 - 1.2.0

A working version of app which was constantly enriched with minor fixes that did not affect the correct operation of the service.
