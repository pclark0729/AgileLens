# 📊 AgileLens Test Data

This directory contains sample CSV files that you can import into AgileLens to test the application's features.

## 📁 Available Test Datasets

### 1. `sample-sprint-data.csv` (Recommended)
- **15 sprints** of realistic data
- **5-person team** throughout
- **Story points range**: 19-28
- **Completion rates**: 85-96%
- **Blockers**: 0-3 per sprint
- **Time period**: 7 months (Jan-Jul 2024)

### 2. `quick-test-data.csv` (Quick Testing)
- **5 sprints** for fast testing
- **4-person team**
- **Story points range**: 20-27
- **Completion rates**: 80-93%
- **Time period**: 2.5 months

### 3. `comprehensive-test-data.csv` (Advanced Testing)
- **16 sprints** with varying team sizes
- **Team sizes**: 4-7 people
- **Story points range**: 22-42
- **Completion rates**: 80-93%
- **Time period**: 10 months (Jan-Oct 2024)
- **Includes team size changes** for testing AI forecasting

## 🚀 How to Import

1. **Go to the Sprints page** in AgileLens
2. **Click "Import CSV"** button
3. **Select one of the CSV files** from this directory
4. **Review the data** in the preview
5. **Click "Import"** to add the data

## 📈 What You Can Test

### Basic Features
- ✅ Sprint data visualization
- ✅ Velocity charts
- ✅ Burndown charts
- ✅ Sprint statistics

### AI Features (Requires 3+ sprints)
- ✅ Sprint capacity forecasting
- ✅ Risk identification
- ✅ Performance recommendations
- ✅ Velocity trend analysis

### Advanced Features
- ✅ Team size impact analysis
- ✅ Seasonal performance patterns
- ✅ Blocker impact assessment
- ✅ Completion rate trends

## 📊 Data Structure

Each CSV file contains the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| `sprint_name` | Name of the sprint | "Sprint 1 - Foundation" |
| `start_date` | Sprint start date | "2024-01-01" |
| `end_date` | Sprint end date | "2024-01-14" |
| `story_points_committed` | Planned story points | 21 |
| `story_points_completed` | Actual completed points | 18 |
| `team_size` | Number of team members | 5 |
| `blockers` | Number of blockers encountered | 2 |
| `notes` | Additional notes | "Initial setup and core features" |

## 🎯 Recommended Testing Flow

1. **Start with `quick-test-data.csv`** for basic functionality
2. **Import `sample-sprint-data.csv`** for full feature testing
3. **Try `comprehensive-test-data.csv`** for advanced AI features
4. **Test AI forecasting** with different datasets
5. **Compare results** across different team sizes

## 🔧 Customizing Test Data

You can modify these CSV files to test specific scenarios:

- **Change team sizes** to test team scaling
- **Adjust story points** to test capacity planning
- **Modify completion rates** to test risk detection
- **Add more blockers** to test impact analysis
- **Extend time periods** to test long-term trends

## 📝 Notes

- All dates are in YYYY-MM-DD format
- Story points are integers
- Team size should be realistic (2-10 people)
- Blockers should be 0 or positive integers
- Notes are optional but helpful for context

Happy testing! 🚀
