// src/lib/uiClasses.ts
export const cardClasses =
    'bg-card text-card-foreground shadow-sm rounded-lg border';
export const cardHeaderClasses = 'p-6';
export const cardTitleClasses = 'text-xl font-semibold tracking-tight';
export const cardDescriptionClasses = 'text-sm text-muted-foreground';
export const cardContentClasses = 'p-6 pt-0 space-y-4';
export const cardFooterClasses =
    'p-6 pt-0 flex flex-col items-start space-y-2';

export const buttonClasses =
    'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
export const primaryButtonClasses = `${buttonClasses} bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2`;
export const outlineButtonClasses = `${buttonClasses} border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2`;
export const destructiveButtonClasses = `${buttonClasses} bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2`;

export const inputClasses =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
export const labelClasses =
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
export const selectClasses = `${inputClasses}`;
export const textareaClasses =
    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
export const progressBaseClasses =
    'relative h-4 w-full overflow-hidden rounded-full bg-secondary';
export const progressIndicatorClasses =
    'h-full w-full flex-1 bg-primary transition-all';
export const svelteProgressClasses =
    '[&::-webkit-progress-value]:bg-primary dark:[&::-webkit-progress-value]:bg-primary w-full [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-slate-200 dark:[&::-webkit-progress-bar]:bg-slate-700 [&::-webkit-progress-value]:rounded-lg';