from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Session
from fastapi import Depends

# This is the database credentials
# need palitan 'to na need match din sa web db natin para on sync sila :)
# For now yung phpMyAdmin nalang muna gamitin
DATABASE_URL = "mysql+pymysql://root@localhost:3306/ehr_db"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# for safe access sa db
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()