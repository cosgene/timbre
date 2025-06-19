import { MessagesSquare } from "lucide-react";

const ServerIdPage = () => {
    return (  
       <div className="flex flex-col items-center justify-center min-h-screen text-zinc-500 dark:text-burgundy-200">
            <MessagesSquare className="h-32 w-32 mb-4"/>
            <h1 className="uppercase font-semibold text-center mb-1">Добро пожаловать!</h1>
            <p className="text-center max-w-md">
                Начните диалог с участником или выберите текстовый или голосовой канал из доступных.
            </p>
        </div>
    );
}
 
export default ServerIdPage;