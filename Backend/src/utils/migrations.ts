import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const runMigrations = async (): Promise<void> => {
  try {
    // Use 'prisma migrate deploy' for production (doesn't prompt for confirmation)
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    
    if (stderr && !stderr.includes('No schema changes')) {
      console.warn('Migration warnings:', stderr);
    }
    
    if (stdout) {
      console.log(stdout);
    }
  } catch (error: any) {
    // If no migrations are pending, this is fine
    if (error.message?.includes('No pending migrations')) {
      console.log('✅ Database is up to date');
      return;
    }
    
    console.error('Migration failed:', error.message);
    throw error;
  }
};
