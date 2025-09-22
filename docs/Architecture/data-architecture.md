# Data Architecture

## Domain Model Structure

The domain model is structured to represent the core entities and their relationships within the application. Key entities include:

1. **Resume**:
   - Represents a user's resume.
   - Uploaded via UI (`<ResumeUpload>`) and parsed via API (`POST /api/resumes/parse`).
   - Supported types: PDF, DOCX, TXT, MD (max 5MB).
   - DB schema:

     ```sql
     id TEXT PRIMARY KEY,
     content TEXT, -- base64 file
     resume_data TEXT, -- JSON
     job_details TEXT, -- JSON
     created_at TEXT
     ```

   - Contains fields such as `name`, `contactInfo`, `workExperience`, and `skills`.

2. **Work Experience**:
   - Represents a specific job or role held by the user.
   - Contains fields such as `companyName`, `role`, `responsibilities`, and `achievements`.

3. **Skills**:
   - Represents a skill or competency.
   - Contains fields such as `skillName` and `proficiencyLevel`.

## Entity Relationships

- **Resume ↔ Work Experience**:
  - One-to-Many relationship: A resume can have multiple work experiences.

- **Resume ↔ Skills**:
  - One-to-Many relationship: A resume can have multiple skills.

## Data Access Patterns

- **Repositories**:
  - The `ResumeRepository` handles CRUD operations for resumes.
  - The `WorkExperienceRepository` and `SkillsRepository` manage their respective entities.

- **Query Patterns**:
  - Resumes are fetched along with their associated work experiences and skills using JOIN queries.
  - Filtering and sorting are applied based on user preferences (e.g., by date or relevance).

## Caching Strategies

- **In-Memory Caching**:
  - Frequently accessed data, such as user resumes, is cached in memory to reduce database load.

- **Cache Invalidation**:
  - Cache entries are invalidated when the underlying data changes (e.g., when a resume is updated).

## Data Validation Patterns

- **Schema Validation**:
  - The `zod` library is used to validate data structures before they are persisted to the database.

- **Business Rule Validation**:
  - Custom validation logic ensures that resumes meet specific criteria (e.g., no duplicate skills).

## Data Transformation

- **Mapping**:
  - Data is mapped between database entities and domain models using transformation utilities.

- **Normalization**:
  - Data is normalized to reduce redundancy and improve consistency.

## Future Enhancements

- **Database Indexing**:
  - Add indexes to frequently queried fields to improve performance.

- **Advanced Caching**:
  - Implement distributed caching for scalability.

- **Data Analytics**:
  - Introduce analytics to provide insights into user behavior and resume trends.
